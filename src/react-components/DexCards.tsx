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
        { name: 'QuickSwap', network: 'Polygon', dexLogo: QuickswapLogo, networkLogo: PolygonLogo, id: 'QuickSwap Polygon' },
        { name: 'QuickSwap', network: 'Dogechain', dexLogo: QuickswapLogo, networkLogo: DogechainLogo, id: 'QuickSwap Dogechain' },
        { name: 'StellaSwap', network: 'Moonbeam', dexLogo: StellaswapLogo, networkLogo: MoonbeamLogo, id: 'StellaSwap' },
    ]

    return <div className="flex flex-wrap h-full bg-[#0a090f] rounded-tr-lg">
        {
            dexes.map((dex, i) => <div key={i} className={`relative flex items-center border-solid border-b-2 py-4 px-8 w-full lg:w-fit cursor-pointer select-none ${selectedDex === dex.id ? 'bg-[#130e28] border-[#36f]' : 'bg-[#0a090f] border-[#0a090f] hover:bg-black hover:border-[#101c3d]'}`} onClick={() => selectDex(selectedDex === dex.id ? null : dex.id)} >
                <div className="relative">
                    {/* @ts-ignore */}
                    <img src={dex.dexLogo.src}
                        alt={dex.name}
                        width={32}
                        height={32}
                        className={`object-contain rounded-full border-1 w-[32px] h-[32px]`}
                    />
                    {/* @ts-ignore */}
                    <img src={dex.networkLogo.src}
                        alt={dex.network}
                        width={20}
                        height={20}
                        className={`absolute top-[-6px] right-[-6px] object-contain rounded-full border-solid border-2 w-[20px] h-[20px] ${selectedDex === dex.id ? 'border-[#130e28]' : 'border-[#0f0e15]'}`}
                    />
                </div>
                <div className="ml-4">
                    <div className={`font-semibold`}>{dex.name}</div>
                    <div className="rounded-b-lg text-[#b7b7b7] text-xs">{dex.network}</div>
                    {/* {
                    dex.locked ? <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center rounded-xl text-[#36f] bg-black/80">
                        Coming Soon
                    </div> : null
                } */}
                    {
                        selectedDex === dex.id ? <div className="absolute flex items-center justify-center top-[8px] right-[8px] rounded-full w-4 h-4 bg-[#e05c5c]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </div> : null
                    }
                </div>
            </div>)
        }
    </div>
}