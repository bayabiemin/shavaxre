# /deploy-fuji — Fuji Testnet'e Deploy

Shavaxre contract'ını Avalanche Fuji Testnet'e deploy et ve gerekli dosyaları güncelle.

## Adımlar

1. `.env` dosyasında `PRIVATE_KEY` tanımlı mı kontrol et
2. `npx hardhat compile` çalıştır — hata varsa düzelt
3. `npx hardhat run scripts/deploy.js --network fuji` çalıştır
4. Deploy edilen contract adresini al
5. `src/lib/contract.ts` dosyasındaki `CONTRACT_ADDRESS` değerini yeni adresle güncelle
6. `npx hardhat verify --network fuji <ADRES>` ile contract'ı Snowtrace'de doğrula
7. Sonuçları raporla: contract adresi, tx hash, Snowtrace linki
