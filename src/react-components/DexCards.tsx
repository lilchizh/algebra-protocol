import QuickswapLogo from '../images/quickswap-logo.png'
import StellaswapLogo from '../images/stellaswap-logo.png'
import UbeswapLogo from '../images/ubeswap-logo.png'
import CamelotLogo from '../images/camelot-logo.png'

import PolygonLogo from '../images/polygon-logo.png'
import MoonbeamLogo from '../images/moonbeam-logo.png'
import DogechainLogo from '../images/dogechain-logo.png'
import CeloLogo from '../images/celo-logo.png'
import ArbitrumLogo from '../images/arbitrum-logo.png'
import Secret from '../images/secret.png'
import AlgebraLogo from '../images/algebra-logo.png'

interface IDexCards {
    selectedDex: string
    selectDex: (dex: string) => void
}

export default function DexCards({ selectedDex, selectDex }: IDexCards) {

    const dexes = [
        { name: 'Algebra Protocol', network: 'All chains', dexLogo: null, networkLogo: null, id: 'Algebra Protocol' },
        { name: 'QuickSwap', network: 'Polygon', dexLogo: QuickswapLogo, networkLogo: PolygonLogo, id: 'QuickSwap Polygon' },
        { name: 'QuickSwap', network: 'Dogechain', dexLogo: QuickswapLogo, networkLogo: DogechainLogo, id: 'QuickSwap Dogechain' },
        { name: 'StellaSwap', network: 'Moonbeam', dexLogo: StellaswapLogo, networkLogo: MoonbeamLogo, id: 'StellaSwap' },
        { name: 'Coming Soon', network: '???', dexLogo: Secret, networkLogo: Secret, id: 'secret', locked: true },
    ]

    return <div className="flex h-full bg-[#0a090f] rounded-tl-lg rounded-tr-lg overflow-x-auto">
        {
            dexes.map((dex, i) => <div key={i} className={`relative flex items-center border-solid border-b-2 py-4 px-8 lg:min-w-fit cursor-pointer select-none ${selectedDex === dex.id ? 'bg-[#130e28] border-[#36f]' : `bg-[#0a090f] border-[#0a090f] ${dex.locked ? 'cursor-default' : 'hover:bg-black hover:border-[#101c3d]'}`}`} onClick={() => dex.locked ? null : selectDex(dex.id)} >
                <div className="relative">
                    {/* @ts-ignore */}
                    {
                        dex.dexLogo ?
                            <img src={dex.dexLogo.src}
                                alt={dex.name}
                                width={32}
                                height={32}
                                className={`object-contain rounded-full border-1 w-[32px] h-[32px]`}
                            /> : 
                                <div className={`w-[32px] h-[32px] rounded-full bg-[#211f29] border-solid border-2 border-[#36f] bg-no-repeat bg-center bg-[length:25px_25px]`} style={{ backgroundImage: `url(${AlgebraLogo.src})` }}></div>
                    }
                    {
                        dex.networkLogo ?
                            <img src={dex.networkLogo.src}
                                alt={dex.network}
                                width={20}
                                height={20}
                                className={`absolute top-[-6px] right-[-6px] object-contain rounded-full border-solid border-2 w-[20px] h-[20px] ${selectedDex === dex.id ? 'border-[#130e28]' : 'border-[#0f0e15]'}`}
                            /> : null
                    }
                </div>
                <div className="ml-4">
                    <div className={`font-semibold`}>{dex.name}</div>
                    <div className="rounded-b-lg text-[#b7b7b7] text-xs">{dex.network}</div>
                </div>
            </div>)
        }
    </div>
}