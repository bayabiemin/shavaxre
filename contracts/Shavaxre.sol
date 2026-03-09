// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ShaVaxRe {
    uint256 private _locked = 1;
    modifier nonReentrant() {
        require(_locked == 1, "Reentrant");
        _locked = 2;
        _;
        _locked = 1;
    }

    address public owner;
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    uint256 public constant STAKE_AMOUNT = 0.1 ether;
    uint256 public constant PHASE1_BPS = 6500;
    uint256 public constant PHASE2_BPS = 3500;
    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public constant VOTING_PERIOD = 48 hours;
    uint256 public constant QUORUM_BPS = 3000;

    enum Status { Active, Phase1Released, VotingOpen, Completed, Failed, Flagged }

    struct Campaign {
        address creator;
        string metadataURI;
        uint256 goalAmount;
        uint256 totalRaised;
        uint256 stakeDeposit;
        uint256 likes;
        Status status;
        uint256 votingDeadline;
        string proofURI;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 uniqueDonors;
        uint256 createdAt;
    }

    uint256 public campaignCount;
    address public treasury;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public donations;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public hasLiked;

    event CampaignCreated(uint256 indexed id, address indexed creator, uint256 goal, string metadataURI);
    event Donated(uint256 indexed id, address indexed donor, uint256 amount);
    event Liked(uint256 indexed id, address indexed user);
    event Phase1Released(uint256 indexed id, uint256 amount);
    event ProofSubmitted(uint256 indexed id, string proofURI);
    event Voted(uint256 indexed id, address indexed voter, bool approve);
    event Phase2Released(uint256 indexed id, uint256 amount);
    event CampaignFailed(uint256 indexed id, uint256 treasuryAmount);
    event CampaignFlagged(uint256 indexed id, uint256 slashedStake);

    constructor(address _treasury) {
        require(_treasury != address(0), "Zero treasury");
        owner = msg.sender;
        treasury = _treasury;
    }

    function createCampaign(string calldata _metadataURI, uint256 _goalAmount) external payable {
        require(msg.value >= STAKE_AMOUNT, "Stake 0.1 AVAX required");
        require(_goalAmount > 0, "Goal must be > 0");
        uint256 id = campaignCount++;
        Campaign storage c = campaigns[id];
        c.creator = msg.sender;
        c.metadataURI = _metadataURI;
        c.goalAmount = _goalAmount;
        c.stakeDeposit = msg.value;
        c.status = Status.Active;
        c.createdAt = block.timestamp;
        emit CampaignCreated(id, msg.sender, _goalAmount, _metadataURI);
    }

    function donate(uint256 _campaignId) external payable nonReentrant {
        Campaign storage c = campaigns[_campaignId];
        require(c.status == Status.Active, "Not active");
        require(msg.value > 0, "Zero donation");
        if (donations[_campaignId][msg.sender] == 0) c.uniqueDonors++;
        donations[_campaignId][msg.sender] += msg.value;
        c.totalRaised += msg.value;
        emit Donated(_campaignId, msg.sender, msg.value);
        if (c.totalRaised >= c.goalAmount) _releasePhase1(_campaignId);
    }

    function likeCampaign(uint256 _campaignId) external {
        require(campaigns[_campaignId].status == Status.Active, "Not active");
        require(!hasLiked[_campaignId][msg.sender], "Already liked");
        hasLiked[_campaignId][msg.sender] = true;
        campaigns[_campaignId].likes++;
        emit Liked(_campaignId, msg.sender);
    }

    function _releasePhase1(uint256 _campaignId) internal {
        Campaign storage c = campaigns[_campaignId];
        c.status = Status.Phase1Released;
        uint256 amt = (c.totalRaised * PHASE1_BPS) / BPS_DENOMINATOR;
        (bool ok, ) = payable(c.creator).call{value: amt}("");
        require(ok, "Phase1 failed");
        emit Phase1Released(_campaignId, amt);
    }

    function submitProof(uint256 _campaignId, string calldata _proofURI) external {
        Campaign storage c = campaigns[_campaignId];
        require(msg.sender == c.creator, "Not creator");
        require(c.status == Status.Phase1Released, "Wrong status");
        require(bytes(c.proofURI).length == 0, "Already submitted");
        c.proofURI = _proofURI;
        c.status = Status.VotingOpen;
        c.votingDeadline = block.timestamp + VOTING_PERIOD;
        emit ProofSubmitted(_campaignId, _proofURI);
    }

    function vote(uint256 _campaignId, bool _approve) external {
        Campaign storage c = campaigns[_campaignId];
        require(c.status == Status.VotingOpen, "Voting not open");
        require(block.timestamp <= c.votingDeadline, "Expired");
        require(!hasVoted[_campaignId][msg.sender], "Already voted");
        require(donations[_campaignId][msg.sender] > 0, "Not a donor");
        hasVoted[_campaignId][msg.sender] = true;
        if (_approve) c.yesVotes++; else c.noVotes++;
        emit Voted(_campaignId, msg.sender, _approve);
    }

    function finalizeVoting(uint256 _campaignId) external nonReentrant {
        Campaign storage c = campaigns[_campaignId];
        require(c.status == Status.VotingOpen, "Not voting");
        uint256 totalVotes = c.yesVotes + c.noVotes;
        uint256 quorum = (c.uniqueDonors * QUORUM_BPS) / BPS_DENOMINATOR;
        bool expired = block.timestamp > c.votingDeadline;
        bool quorumMet = totalVotes >= quorum;
        require(expired || quorumMet, "Still active");
        uint256 phase2 = (c.totalRaised * PHASE2_BPS) / BPS_DENOMINATOR;
        if (quorumMet && c.yesVotes > c.noVotes) {
            c.status = Status.Completed;
            (bool a, ) = payable(c.creator).call{value: phase2}("");
            require(a, "Phase2 failed");
            (bool b, ) = payable(c.creator).call{value: c.stakeDeposit}("");
            require(b, "Stake refund failed");
            emit Phase2Released(_campaignId, phase2);
        } else {
            c.status = Status.Failed;
            uint256 tot = phase2 + c.stakeDeposit;
            (bool ok, ) = payable(treasury).call{value: tot}("");
            require(ok, "Treasury failed");
            emit CampaignFailed(_campaignId, tot);
        }
    }

    function flagCampaign(uint256 _campaignId) external onlyOwner nonReentrant {
        Campaign storage c = campaigns[_campaignId];
        require(c.status == Status.Active, "Not active");
        c.status = Status.Flagged;
        (bool ok, ) = payable(treasury).call{value: c.stakeDeposit}("");
        require(ok, "Slash failed");
        emit CampaignFlagged(_campaignId, c.stakeDeposit);
    }

    function claimRefund(uint256 _campaignId) external nonReentrant {
        require(campaigns[_campaignId].status == Status.Flagged, "Not flagged");
        uint256 d = donations[_campaignId][msg.sender];
        require(d > 0, "Nothing");
        donations[_campaignId][msg.sender] = 0;
        (bool ok, ) = payable(msg.sender).call{value: d}("");
        require(ok, "Refund failed");
    }

    function getCampaign(uint256 _id) external view returns (Campaign memory) {
        return campaigns[_id];
    }

    function getDonation(uint256 _id, address _donor) external view returns (uint256) {
        return donations[_id][_donor];
    }

    function getVotingStatus(uint256 _id) external view returns (
        uint256, uint256, uint256, uint256, bool
    ) {
        Campaign storage c = campaigns[_id];
        return (c.yesVotes, c.noVotes, c.votingDeadline, c.uniqueDonors,
                c.status == Status.VotingOpen && block.timestamp <= c.votingDeadline);
    }

    function getTrendingScore(uint256 _id) external view returns (uint256) {
        Campaign storage c = campaigns[_id];
        return (c.likes * 2) + (c.uniqueDonors * 5) + (c.totalRaised / 1e16);
    }

    function setTreasury(address _t) external onlyOwner {
        require(_t != address(0)); treasury = _t;
    }

    function transferOwnership(address _o) external onlyOwner {
        require(_o != address(0)); owner = _o;
    }

    receive() external payable {}
}
