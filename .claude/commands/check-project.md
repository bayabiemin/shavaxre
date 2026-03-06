# /check-project — Proje Sağlık Kontrolü

Shavaxre projesinin genel durumunu kontrol et ve rapor çıkar.

## Kontrol Adımları

1. **Build Check**: `npm run build` çalıştır. Hata varsa listele.
2. **Lint Check**: `npm run lint` çalıştır. Warning ve error'ları listele.
3. **Contract Compile**: `npx hardhat compile` çalıştır. Hata varsa listele.
4. **Dependency Check**: `npm audit` çalıştır. Critical/High vulnerability varsa uyar.
5. **TypeScript Check**: `npx tsc --noEmit` çalıştır. Type error'ları listele.
6. **Env Check**: `.env` dosyasında gerekli değişkenler tanımlı mı kontrol et (PRIVATE_KEY, SNOWTRACE_API_KEY).
7. **Git Status**: Commit edilmemiş değişiklikler var mı kontrol et.

## Çıktı
Her adım için: ✅ Başarılı / ❌ Hatalı (detay) formatında özet tablo oluştur.
