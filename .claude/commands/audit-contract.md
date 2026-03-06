# /audit-contract — Smart Contract Güvenlik Denetimi

Shavaxre.sol dosyasını oku ve aşağıdaki güvenlik kontrol listesine göre tam bir denetim yap:

## Kontrol Adımları

1. **Reentrancy Analizi**: Tüm external call'ları bul. Her birinin CEI (Checks-Effects-Interactions) pattern'ine uyup uymadığını kontrol et.

2. **Access Control**: Modifier'ları incele. Yetkisiz erişim riski olan fonksiyonları tespit et.

3. **Integer Overflow/Underflow**: Solidity 0.8+ default korumayı doğrula. Manuel unchecked blokları var mı kontrol et.

4. **Fund Locking Riski**: Deadline geçen kampanyalarda kilitlenen AVAX var mı? Refund mekanizması eksik mi?

5. **Gas Optimization**: Loop'ları incele. O(n) karmaşıklıkta fonksiyonlar campaign sayısı artınca sorun yaratır mı?

6. **Event Emitting**: Tüm state-changing fonksiyonlar event emit ediyor mu?

7. **docs/contracts/SECURITY_CHECKLIST.md** dosyasını oku ve mevcut checklist'i güncelle.

## Çıktı Formatı
Her bulgu için: [SEVERİTY: Critical/High/Medium/Low/Info] — Açıklama — Önerilen düzeltme kodu
