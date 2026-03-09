# BUGFIX: Campaign Detail Page Boş Görünüyor

## Sorun
`/campaign/[id]` sayfası açılınca bağış formu ve kampanya detayları görünmüyor.
Browser console'da şu hatalar var:

```
@TODO Error: could not coalesce error
error={ "code": -32000, "message": "filter not found" }
method: "eth_getFilterChanges"
```

## Kök Neden

`src/app/campaign/[id]/page.tsx` satır 114-125:

```typescript
// Load recent donor events
const contract = getContract(provider);
const filter = contract.filters.DonationReceived(id);
const events = await contract.queryFilter(filter);  // ← BURADA PATLIYIOR
```

**Avalanche Fuji public RPC** (`api.avax-test.network`) event filter'ları desteklemiyor.
`queryFilter()` çağrısı `eth_getLogs` veya `eth_getFilterChanges` yapıyor ve RPC `-32000: filter not found` hatası dönüyor.

Bu hata `catch` bloğuna düşüyor (satır 126) ve `setNotFound(true)` yapıyor → **tüm sayfa "Campaign not found" gösteriyor**.

## Fix

### Fix 1: Event query'yi kampanya yüklemeden AYIR (KRİTİK)

`loadCampaign` fonksiyonunda event query başarısız olsa bile kampanya verisinin gösterilmesi lazım.

```typescript
const loadCampaign = useCallback(async () => {
    try {
        setLoading(true);
        const provider = new JsonRpcProvider(FUJI_RPC);
        const data = await getCampaignById(provider, id);
        setCampaign(data);

        // Donor events'i AYRI try-catch'e al — başarısız olursa kampanya yine gösterilsin
        try {
            const contract = getContract(provider);
            const filter = contract.filters.DonationReceived(id);
            const events = await contract.queryFilter(filter);
            const parsed: DonationEvent[] = [...events].reverse().slice(0, 5).map((e: any) => ({
                donor: e.args[1] as string,
                amount: parseFloat(formatEther(e.args[2])).toFixed(4),
                txHash: e.transactionHash,
                blockNumber: e.blockNumber,
            }));
            setDonors(parsed);
        } catch (eventErr) {
            // Event query başarısız — sessizce devam et, donors boş kalır
            console.warn("Could not load donation events:", eventErr);
        }
    } catch {
        setNotFound(true);
    } finally {
        setLoading(false);
    }
}, [id]);
```

### Fix 2: (Opsiyonel ama önerilen) queryFilter'a block range ver

Fuji RPC bazen sınırsız block range'de log query'yi reddediyor. Son 5000 blok ile sınırla:

```typescript
try {
    const contract = getContract(provider);
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 5000);
    const filter = contract.filters.DonationReceived(id);
    const events = await contract.queryFilter(filter, fromBlock, currentBlock);
    // ... parse events
} catch (eventErr) {
    console.warn("Could not load donation events:", eventErr);
}
```

## Dashboard Sorunu

Dashboard sayfası (`src/app/dashboard/page.tsx`) kod olarak mevcut.
Eğer local'de görünmüyorsa:

1. `npm run dev` sunucusunu durdur ve yeniden başlat (`Ctrl+C` → `npm run dev`)
2. `.next` cache klasörünü sil: `rm -rf .next && npm run dev`
3. `localhost:3000/dashboard` adresini dene

Dashboard'da da benzer bir event query sorunu olabilir — aynı fix pattern'ini orada da uygula (event query'leri ayrı try-catch'e al).

## Değişecek Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| `src/app/campaign/[id]/page.tsx` | loadCampaign içinde event query'yi ayrı try-catch'e al |
| `src/app/dashboard/page.tsx` | Aynı pattern — event query'leri ayrı try-catch |

## Test

1. `/campaign/0` veya `/campaign/1` aç → Kampanya detayı ve bağış formu görünmeli
2. Console'da `@TODO Error: filter not found` hatası yerine `warn: Could not load donation events` görünecek
3. Bağış formu çalışır durumda olacak
4. `/dashboard` aç → Sayfa yüklenmeli
