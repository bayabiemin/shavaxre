// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Sha(vax)re — Decentralized Education Crowdfunding
 * @notice Built on Avalanche C-Chain for Build Games 2026
 * @dev P2P education funding with on-chain transparency & corporate matching
 */
contract Shavaxre {

    // ═══════════════════════════════════════════════════════════════
    //                         DATA STRUCTURES
    // ═══════════════════════════════════════════════════════════════

    struct Campaign {
        address payable student;
        string  title;
        string  description;
        string  category;        // e.g. "Tuition", "Books", "Research"
        uint256 goalAmount;      // target in wei
        uint256 raisedAmount;    // total collected
        uint256 deadline;        // unix timestamp
        bool    active;
        bool    claimed;
        uint256 donorCount;
    }

    // ═══════════════════════════════════════════════════════════════
    //                         STATE VARIABLES  
    // ═══════════════════════════════════════════════════════════════

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public donations; // campaignId => donor => amount

    // Corporate matching pools
    mapping(address => uint256) public corporateMatchPool; // corp address => pool balance
    mapping(address => uint256) public matchMultiplier;    // corp address => multiplier (100 = 1x)

    address public owner;

    // ═══════════════════════════════════════════════════════════════
    //                              EVENTS
    // ═══════════════════════════════════════════════════════════════

    event CampaignCreated(uint256 indexed id, address indexed student, string title, uint256 goal, uint256 deadline);
    event DonationReceived(uint256 indexed id, address indexed donor, uint256 amount);
    event MatchedDonation(uint256 indexed id, address indexed corporate, uint256 matchAmount);
    event FundsClaimed(uint256 indexed id, address indexed student, uint256 amount);
    event CorporatePoolFunded(address indexed corporate, uint256 amount, uint256 multiplier);

    // ═══════════════════════════════════════════════════════════════
    //                            MODIFIERS
    // ═══════════════════════════════════════════════════════════════

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier campaignExists(uint256 _id) {
        require(_id < campaignCount, "Campaign not found");
        _;
    }

    modifier isActive(uint256 _id) {
        require(campaigns[_id].active, "Campaign not active");
        _;
    }

    // ═══════════════════════════════════════════════════════════════
    //                           CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════

    constructor() {
        owner = msg.sender;
    }

    // ═══════════════════════════════════════════════════════════════
    //                        CORE FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Student creates a new funding campaign
     * @param _title Campaign title
     * @param _description What the funds will be used for
     * @param _category Education category
     * @param _goalAmount Target amount in wei (AVAX)
     * @param _durationDays Campaign duration in days
     */
    function createCampaign(
        string calldata _title,
        string calldata _description,
        string calldata _category,
        uint256 _goalAmount,
        uint256 _durationDays
    ) external {
        require(_goalAmount > 0, "Goal must be > 0");
        require(_durationDays > 0 && _durationDays <= 365, "Invalid duration");
        require(bytes(_title).length > 0, "Title required");

        uint256 deadline = block.timestamp + (_durationDays * 1 days);

        campaigns[campaignCount] = Campaign({
            student: payable(msg.sender),
            title: _title,
            description: _description,
            category: _category,
            goalAmount: _goalAmount,
            raisedAmount: 0,
            deadline: deadline,
            active: true,
            claimed: false,
            donorCount: 0
        });

        emit CampaignCreated(campaignCount, msg.sender, _title, _goalAmount, deadline);
        campaignCount++;
    }

    /**
     * @notice Donate AVAX to a student's campaign (P2P, zero commission)
     * @param _id Campaign ID
     */
    function donate(uint256 _id) 
        external 
        payable 
        campaignExists(_id) 
        isActive(_id) 
    {
        require(msg.value > 0, "Donation must be > 0");
        require(block.timestamp <= campaigns[_id].deadline, "Campaign ended");

        Campaign storage campaign = campaigns[_id];
        
        if (donations[_id][msg.sender] == 0) {
            campaign.donorCount++;
        }
        
        campaign.raisedAmount += msg.value;
        donations[_id][msg.sender] += msg.value;

        emit DonationReceived(_id, msg.sender, msg.value);
    }

    /**
     * @notice Student withdraws collected funds — zero commission, direct P2P
     * @param _id Campaign ID
     */
    function claimFunds(uint256 _id) 
        external 
        campaignExists(_id) 
    {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.student, "Only campaign creator");
        require(!campaign.claimed, "Already claimed");
        require(campaign.raisedAmount > 0, "No funds to claim");

        campaign.claimed = true;
        campaign.active = false;

        uint256 amount = campaign.raisedAmount;
        (bool sent, ) = campaign.student.call{value: amount}("");
        require(sent, "Transfer failed");

        emit FundsClaimed(_id, campaign.student, amount);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     CORPORATE MATCHING
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Corporate sponsors fund a matching pool
     * @param _multiplier Match multiplier (100 = 1x match, 200 = 2x match)
     */
    function fundMatchingPool(uint256 _multiplier) external payable {
        require(msg.value > 0, "Must fund pool");
        require(_multiplier >= 100, "Min 1x match");

        corporateMatchPool[msg.sender] += msg.value;
        matchMultiplier[msg.sender] = _multiplier;

        emit CorporatePoolFunded(msg.sender, msg.value, _multiplier);
    }

    /**
     * @notice Trigger corporate match for a specific campaign donation
     * @param _id Campaign ID
     * @param _corporate Corporate sponsor address
     * @param _donationAmount Original donation amount to match
     */
    function matchDonation(
        uint256 _id,
        address _corporate,
        uint256 _donationAmount
    ) 
        external 
        campaignExists(_id) 
        isActive(_id) 
    {
        uint256 pool = corporateMatchPool[_corporate];
        uint256 mult = matchMultiplier[_corporate];
        require(pool > 0, "No matching pool");

        uint256 matchAmount = (_donationAmount * mult) / 100;
        if (matchAmount > pool) {
            matchAmount = pool;
        }

        corporateMatchPool[_corporate] -= matchAmount;
        campaigns[_id].raisedAmount += matchAmount;

        emit MatchedDonation(_id, _corporate, matchAmount);
    }

    // ═══════════════════════════════════════════════════════════════
    //                         VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function getCampaign(uint256 _id) external view campaignExists(_id) returns (Campaign memory) {
        return campaigns[_id];
    }

    function getActiveCampaigns() external view returns (Campaign[] memory, uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].active && block.timestamp <= campaigns[i].deadline) {
                activeCount++;
            }
        }

        Campaign[] memory activeCampaigns = new Campaign[](activeCount);
        uint256[] memory ids = new uint256[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < campaignCount; i++) {
            if (campaigns[i].active && block.timestamp <= campaigns[i].deadline) {
                activeCampaigns[index] = campaigns[i];
                ids[index] = i;
                index++;
            }
        }

        return (activeCampaigns, ids);
    }

    function getDonation(uint256 _id, address _donor) external view returns (uint256) {
        return donations[_id][_donor];
    }
}
