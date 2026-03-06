# Smart Contract Security Checklist — Shavaxre

## Pre-Deploy Kontrol Listesi

### Reentrancy
- [ ] Tüm external call'lar CEI (Checks-Effects-Interactions) pattern izliyor mu?
- [ ] `claimFunds()` — state değişikliği (`claimed = true`) transfer'dan ÖNCE mi?
- [ ] OpenZeppelin ReentrancyGuard eklenecek mi?

### Access Control
- [ ] `onlyOwner` modifier sadece gerekli yerlerde mi?
- [ ] `claimFunds()` sadece campaign creator'a mı açık?
- [ ] `matchDonation()` herkes tarafından çağrılabilir — bu kasıtlı mı?

### Input Validation
- [ ] `createCampaign()` — string length limitleri var mı?
- [ ] `donate()` — overflow kontrolü (Solidity 0.8+ default kontrol eder)
- [ ] `fundMatchingPool()` — multiplier üst limiti var mı?

### Fund Safety
- [ ] Contract'ta kalan orphan fund riski var mı?
- [ ] Deadline geçen kampanyalarda kilitli kalan AVAX için refund mekanizması?
- [ ] Corporate matching pool'dan geri çekim (withdraw) fonksiyonu?

### Gas Optimization
- [ ] `getActiveCampaigns()` — O(n) loop, campaign sayısı artınca gas limiti?
- [ ] Mapping yerine array kullanılabilir mi?
- [ ] Event'ler yeterli indexed parametreye sahip mi?

## Bilinen İyileştirme Alanları
1. ReentrancyGuard eklenmeli (`claimFunds`, `matchDonation`)
2. Refund mekanizması eksik (deadline geçen kampanyalar)
3. Campaign deactivation fonksiyonu eksik (student iptal edebilmeli)
4. String length limitleri eklenmeli (DoS önlemi)
5. Pausable pattern eklenebilir (acil durum için)
