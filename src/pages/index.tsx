import { ResponseMeta, getRacknerdData } from '@app/scripts/racknerd-data';
import { VpsData } from '@app/scripts/vpsdata';
import { VpsTable } from '@app/scripts/vpstable';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {
    const [meta, setMeta] = useState<ResponseMeta | null>(null);
    useEffect(() => {
        async function fetchData() {
            try {
                const [vpsMeta, vpsData] = await getRacknerdData()
                // Tabulator.registerModule([SortModule])
                // var table = new Tabulator("#example-table", {
                //     height: "311px",
                //     columns: [
                //         { title: "id", field: "id" },
                //         { title: "url", field: "url" },
                //         { title: "sales", field: "sales" },
                //         { title: "product", field: "product" },
                //         { title: "cpu", field: "cpu" },
                //         { title: "drive", field: "drive" },
                //         { title: "ram", field: "ram" },
                //         { title: "bandwidth", field: "bandwidth" },
                //         { title: "network", field: "network" },
                //     ],
                //     data: vpsData
                // });
                if (vpsMeta)
                    setMeta(vpsMeta);
                // new
                new VpsTable(vpsData, "#table-new-vps", {
                    initialFilter: [
                        { field: "age", type: "<=", value: 60 }
                    ],
                    initialSort: [
                        { column: "avgPrice", dir: "asc" },
                        { column: "age", dir: "asc" }
                    ],
                    pagination: true
                }, {
                    showTime: true
                })

                // bargain vps
                new VpsTable(vpsData, "#table-bargain-vps", {
                    initialFilter: [
                        { field: "avgPrice", type: "<=", value: 1.5 }
                    ],
                    initialSort: [
                        { column: "avgPrice", dir: "asc" } // 默认按照升序排序
                    ],

                })

                // web server vps
                new VpsTable(vpsData, "#table-web-vps", {
                    initialFilter: [
                        { field: "cpuType", type: "=", value: "vps" },
                        { field: "cpuCores", type: ">=", value: 2 },
                        { field: "cpuCores", type: "<=", value: 4 },
                        { field: "ram", type: ">=", value: VpsData.convertStorageValue(2, "gb") },
                        { field: "ram", type: "<=", value: VpsData.convertStorageValue(8, "gb") },
                    ],
                    initialSort: [
                        { column: "avgPrice", dir: "asc" },
                        { column: "ram", dir: "desc" },
                        { column: "cpuCores", dir: "desc" },
                    ],
                })

                // dedicated server
                new VpsTable(vpsData, "#dedicated-server", {
                    initialFilter: [
                        { field: "cpuType", type: "=", value: "dedicated" }
                    ],
                    initialSort: [
                        { column: "avgPrice", dir: "asc" }
                    ],
                    // pagination: true,
                })

                // all server
                new VpsTable(vpsData, "#all-server", {
                    initialSort: [
                        { column: "avgPrice", dir: "asc" }
                    ],
                    // pagination: true,
                })

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData()
    }, [])
    return (
        <main className={`mx-auto max-w-7xl prose p-5 bg-slate-50`}>
            <Head>
                <title>Racknerd服务器列表 | Racknerd Server List</title>
                <meta name="description" content="定时自动更新Racknerd在售服务器列表 | Timed Automatic Updates for Racknerd On-Sale Servers" />
                <meta name="keywords" content="Racknerd, VPS, dedicated server, 独立服务器, 科学上网"></meta>
            </Head>
            <section>
                <h2>Racknerd服务器看板</h2>
                <div className="rounded-lg shadow-lg border text-sm px-4 bg-white text-slate-700 sm:py-5 sm:px-10 sm:text-base">
                    <div className="flex flex-wrap gap-20">
                        <ul className='[&>li]:list-decimal'>
                            <li>信息可能不准确、缺失，详情以官网信息为准</li>
                            <li>点击CPU项，可显示具体的CPU型号（独服）</li>
                            <li>价格均为折合月均价格，可能不支持月付</li>
                            <li>排序为简单排序，无数据分析，请自行甄别</li>
                            <li>每列头部均有筛选器，可输入数量+单位筛选</li>
                        </ul>
                        <ul className='[&>li]:list-decimal'>
                            <li>Info might be incomplete. Check official site for accuracy.</li>
                            <li>Click CPU for specific model (dedicated server).</li>
                            <li>Prices are monthly averages.</li>
                            <li>Sorting is basic; rankings not data-analyzed; use discretion.</li>
                            <li>Column headers have number + unit filters.</li>
                        </ul>
                    </div>
                    <hr />
                    <ul>
                        <li><span>更多奇技淫巧：</span><a className='hover:text-rose-500' href="https://www.karsonjo.com">我的博客</a></li>
                        <li><span>数据最后更新于：</span><span>{meta?.utcTime.toLocaleString(undefined, { timeZoneName: 'short' })}</span></li>
                    </ul>
                    <hr />
                    <ul>
                        <li>Racknerd所有机器可在LowEndTalk回帖申请流量翻倍</li>
                    </ul>
                </div>
            </section>

            <article className="">
                <section>
                    <h2 className="">新上小鸡</h2>
                    <ul>
                        <li>最近上架、补货的机器</li>
                        <li>相对于记录时间起算
                            <ul>
                                <li>开始记录时视所有商品为新商品</li>
                                <li>新上、新补货的商品排名靠前</li>
                            </ul>
                        </li>
                    </ul>
                </section>
                <section className="shadow-lg h-[60vh] rose-500 not-prose">
                    <div className="" id="table-new-vps"></div>
                </section>
            </article>

            <article className="">
                <section>
                    <h2 className="">便宜小鸡</h2>
                    <ul>
                        <li>平均月租不高于1.5刀的vps</li>
                    </ul>
                </section>
                <section className="shadow-lg h-[60vh] rose-500 not-prose">
                    <div className="" id="table-bargain-vps"></div>
                </section>
            </article>

            <article className="">
                <section>
                    <h2 className="">建站好鸡</h2>
                    <ul>
                        <li>cpu处于2c-4c之间</li>
                        <li>内存处于2g-8g之间</li>
                        <li>同等情况价格升序</li>
                    </ul>
                </section>
                <section className="shadow-lg h-[60vh] rose-500 not-prose">
                    <div className="" id="table-web-vps"></div>
                </section>
            </article>

            <article className="">
                <section>
                    <h2 className="">杜甫</h2>
                    <ul>
                        <li>独立服务器一览</li>
                    </ul>
                </section>
                <section className="shadow-lg h-[80vh] rose-500 not-prose">
                    <div className="" id="dedicated-server"></div>
                </section>
            </article>

            <article className="">
                <section>
                    <h2 className="">所有服务器</h2>
                    <ul>
                        <li>所有服务器一览</li>
                        <li>可能有遗漏，请按官网为准</li>
                    </ul>
                </section>
                <section className="shadow-lg h-[80vh] rose-500 not-prose">
                    <div className="" id="all-server"></div>
                </section>
            </article>
        </main>
    )
}
