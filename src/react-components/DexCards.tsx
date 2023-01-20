import QuickswapLogo from '../images/quickswap-logo.png'
import StellaswapLogo from '../images/stellaswap-logo.png'
import UbeswapLogo from '../images/ubeswap-logo.png'
import CamelotLogo from '../images/camelot-logo.png'

import PolygonLogo from '../images/polygon-logo.png'
import MoonbeamLogo from '../images/moonbeam-logo.png'
import DogechainLogo from '../images/dogechain-logo.png'
import CeloLogo from '../images/celo-logo.png'
import ArbitrumLogo from '../images/arbitrum-logo.png'

interface IDexCards {
    selectedDex: string
    selectDex: (dex: string) => void
}

export default function DexCards({ selectedDex, selectDex }: IDexCards) {

    const dexes = [
        { name: 'QuickSwap', network: 'Polygon', dexLogo: QuickswapLogo, networkLogo: PolygonLogo, id: 'quickswap' },
        { name: 'QuickSwap', network: 'Dogechain', dexLogo: QuickswapLogo, networkLogo: DogechainLogo, id: 'dogechain' },
        { name: 'StellaSwap', network: 'Moonbeam', dexLogo: StellaswapLogo, networkLogo: MoonbeamLogo, id: 'stella' },
        { name: 'UbeSwap', network: 'CELO', dexLogo: UbeswapLogo, networkLogo: CeloLogo, id: 'ubeswap', locked: true },
        { name: 'Camelot', network: 'Arbitrum', dexLogo: CamelotLogo, networkLogo: ArbitrumLogo, id: 'camelot', locked: true },
    ]

    return <div className="flex flex-wrap  lg:gap-6 bg-[#0f0e15] px-8 py-8 gap-8 lg:py-4 rounded-t-lg">
        {
            dexes.map((dex, i) => <div key={i} className={`relative flex flex-col items-center border-solid border-2 p-8 rounded-xl w-full lg:w-[150px] ${selectedDex === dex.id ? 'bg-[#130e28] border-[#36f]' : 'bg-[#0a090f] border-[#0a090f] hover:border-[#101c3d]'} ${dex.locked ? 'cursor-default hover:border-[#0a090f]' : 'cursor-pointer'}`}  onClick={() => dex.locked ? null : selectDex(dex.id)} >
                <div className="relative">
                    {/* @ts-ignore */}
                    <img src={dex.dexLogo.src}
                        alt={dex.name}
                        width={64}
                        height={64}
                        className={`object-contain rounded-full border-1 w-[64px] h-[64px]`}
                    />
                    {/* @ts-ignore */}
                    <img src={dex.networkLogo.src}
                        alt={dex.network}
                        width={24}
                        height={24}
                        className={`absolute top-0 right-0 object-contain rounded-full border-solid border-2 w-[24px] h-[24px] ${selectedDex === dex.id ? 'border-[#130e28]' : 'border-[#0f0e15]'}`}
                    />
                </div>
                <div className={`mt-5 ${selectedDex === dex.id ? 'font-bold' : 'font-semibold'}`}>{dex.name}</div>
                <div className="bg-[#0d091a] mt-4 rounded-b-lg text-[#b7b7b7] uppercase text-xs">{dex.network}</div>
                {
                    dex.locked ? <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center rounded-xl text-[#36f] bg-black/80">
                        Coming Soon
                    </div> : null
                }
            </div>)
        }
    </div>
}