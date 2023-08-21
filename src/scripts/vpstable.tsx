import { CellComponent, EditModule, FilterModule, FormatModule, Options, PageModule, PopupModule, SortModule, Tabulator, TooltipModule } from "tabulator-tables";
import { VpsData } from "./vpsdata";

export class VpsTable {
    static usdStrFromatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    });

    table: Tabulator

    constructor(vpsData: VpsData[], selector: string, options: Options = {}, config: { showTime?: boolean } = {}) {
        Tabulator.registerModule([SortModule, FormatModule, EditModule, FilterModule, PageModule, TooltipModule, PopupModule])

        this.table = new Tabulator(selector,
            {
                ...{
                    // groupBy: function(data){
                    //     //data - the data object for the row being grouped
                    //     return data.sales; //groups by data and age
                    // },
                    movableColumns: true,
                    columnHeaderVertAlign: "bottom",
                    layout: "fitColumns",
                    height: "100%",
                    // initialFilter: filters,
                    // pagination: true,
                    columns: [
                        // { title: "id", field: "id", vertAlign: "middle" },

                        { title: "type", field: "cpuType", vertAlign: "middle", minWidth: 96, headerSort: false, headerFilter: "list", headerFilterParams: { valuesLookup: "active" }, headerFilterPlaceholder: "select..." },

                        { title: "time", field: "age", vertAlign: "middle", minWidth: 96, sorter: "number", visible: config.showTime ? config.showTime : false, headerFilter:"number", headerFilterPlaceholder:"max", headerFilterFunc:"<=" },

                        {
                            title: "specifications",
                            headerHozAlign: "center",
                            columns: [
                                { title: "cores", field: "cpuCores", vertAlign: "middle", minWidth: 128, clickPopup: VpsTable.cpuTooltips as any, formatter: VpsTable.cpuFormatter, sorter: "number", headerFilter: this.minMaxFilterEditorProvider("number"), headerFilterFunc: this.minMaxNumberFilterFunction, headerFilterLiveFilter: false },
                                { title: "mfr.", field: "cpuManufacturer", vertAlign: "middle", minWidth: 96, headerFilter: "list", headerFilterParams: { valuesLookup: "active" } },
                                { title: "ram", field: "ram", vertAlign: "middle", minWidth: 128, formatter: VpsTable.displayMbFormatter, sorter: "number", headerFilter: this.minMaxFilterEditorProvider("text"), headerFilterFunc: this.minMaxStorageFilterFuncion.bind(this), headerFilterLiveFilter: false },
                                { title: "drive", field: "drive", vertAlign: "middle", minWidth: 128, formatter: VpsTable.displayMbFormatter, sorter: "number", headerFilter: this.minMaxFilterEditorProvider("text"), headerFilterFunc: this.minMaxStorageFilterFuncion.bind(this), headerFilterLiveFilter: false },
                                { title: "transfer", field: "bandwidth", vertAlign: "middle", minWidth: 128, formatter: VpsTable.displayMbFormatter, sorter: "number", headerFilter: this.minMaxFilterEditorProvider("text"), headerFilterFunc: this.minMaxStorageFilterFuncion.bind(this), headerFilterLiveFilter: false },
                                { title: "network", field: "network", vertAlign: "middle", minWidth: 128, formatter: VpsTable.displayMbpsFormatter, sorter: "number", headerFilter: this.minMaxFilterEditorProvider("text"), headerFilterFunc: this.minMaxNetworkFilterFuncion.bind(this), headerFilterLiveFilter: false },
                            ]
                        },

                        { title: "price", field: "avgPrice", vertAlign: "middle", minWidth: 128, formatter: VpsTable.priceFormatter, sorter: "number", headerFilter: this.minMaxFilterEditorProvider("number"), headerFilterFunc: this.minMaxNumberFilterFunction, headerFilterLiveFilter: false },
                        { title: "", field: "url", vertAlign: "middle", minWidth: 96, formatter: VpsTable.urlButtonFormatter, headerSort: false },

                        
                        { title: "sales", field: "sales", vertAlign: "middle", widthShrink: 0, headerFilter: "list", headerFilterParams: { valuesLookup: "active" }, visible: false },
                        { title: "product", field: "product", vertAlign: "middle", widthShrink: 0, headerFilter: "input", visible: false },
                        { title: "cpu info", field: "cpuInfo", vertAlign: "middle", headerFilter: "input", visible: false },
                    ],
                    data: vpsData
                },
                ...options
            });
    }

    static cpuTooltips(e: MouseEvent, cell: CellComponent, onRendered: any) {
        return cell.getRow().getCell("cpuInfo").getValue() as string;
    }
    static urlButtonFormatter(cell: CellComponent, formatterParams: object, onRendered: any): string { //plain text value
        return ReactDomServer.renderToString(
            <button className="p-2 m-auto">
                <a className={`px-4 py-2 rounded shadow bg-rose-400 text-white`} href={cell.getValue()} target="_blank">
                    <span>前往</span>
                </a>
            </button>
        )
    };

    static displayMbFormatter(cell: CellComponent, formatterParams: object, onRendered: any): string {
        const displayValue = VpsData.convertStorageToMaxUnit(cell.getValue())
        if (displayValue.value == 0)
            return "unknown";
        if (displayValue.value == Number.MAX_VALUE)
            return "unlimited"
        return displayValue.value + displayValue.unit;
    }

    static displayMbpsFormatter(cell: CellComponent, formatterParams: object, onRendered: any): string {
        const displayValue = VpsData.convertNetworkToMaxUnit(cell.getValue())
        if (displayValue.value == 0)
            return "unknown";
        if (displayValue.value == Number.MAX_VALUE)
            return "unlimited"
        return displayValue.value + displayValue.unit;
    }

    static priceFormatter(cell: CellComponent, formatterParams: object, onRendered: any): string {
        const value = cell.getValue();
        if (isNaN(value))
            return "unknown";
        return VpsTable.usdStrFromatter.format(value);
    }

    static cpuFormatter(cell: CellComponent, formatterParams: object, onRendered: any): string {
        const value = cell.getValue();

        return ReactDomServer.renderToString(
            <span className="flex grow justify-around items-center">
                <span>{value ? value : "?"} </span>
                <span className="rounded-full border-2 text-green-500 border-green-500 shadow aspect-square h-6 emoji-mask flex items-center justify-center cursor-pointer">❓</span>
            </span>
        )
    }

    minMaxFilterEditorProvider(inputType: string) {
        return (cell: any, onRendered: any, success: any, cancel: any, editorParams: any) => {
            var container = document.createElement("span");

            //create and style inputs
            var start = document.createElement("input");

            start.setAttribute("type", inputType);
            start.setAttribute("placeholder", "min");
            start.setAttribute("min", 0 + "px");
            start.setAttribute("max", 100 + "px");
            start.style.padding = "4px";
            start.style.width = "calc(50% - 2px)";
            start.style.boxSizing = "border-box";

            start.value = cell.getValue();

            var end = start.cloneNode() as HTMLInputElement;
            end.setAttribute("placeholder", "max");
            end.style.marginLeft = "4px";

            function buildValues() {
                success({
                    start: start.value,
                    end: end.value,
                });
            }

            function keypress(e: KeyboardEvent) {
                if (e.key == 'Enter') {
                    buildValues();
                }

                if (e.key == 'Escape') {
                    cancel();
                }
            }


            start.addEventListener("change", buildValues);
            start.addEventListener("blur", buildValues);
            start.addEventListener("keydown", keypress);

            end.addEventListener("change", buildValues);
            end.addEventListener("blur", buildValues);
            end.addEventListener("keydown", keypress);


            container.appendChild(start);
            container.appendChild(end);

            return container;
        }
    }

    minMaxNumberFilterFunction(headerValue: any, rowValue: any, rowdata: any, filterparams: any): boolean {
        //headerValue - the value of the header filter element
        //rowValue - the value of the column in this row
        //rowData - the data for the row being filtered
        //filterParams - params object passed to the headerFilterFuncParams property

        let min: number = headerValue.start ? headerValue.start : Number.MIN_VALUE;
        let max: number = Math.max(min, headerValue.end ? headerValue.end : Number.MAX_VALUE);
        return rowValue >= min && rowValue <= max;
        if (rowValue) {
            if (headerValue.start) {
                if (headerValue.end)
                    return rowValue >= headerValue.start && rowValue <= headerValue.end;
                else
                    return rowValue >= headerValue.start;

            } else {
                if (headerValue.end)
                    return rowValue <= headerValue.end;
            }
        }

        return true; //must return a boolean, true if it passes the filter.
    }

    minMaxStorageFilterFuncion(headerValue: any, rowValue: any, rowdata: any, filterparams: any): boolean {
        /**
         * 每次filter，第一次传入的会是string类型
         * 此时需要转换成number
         * 本次filter随后都会被该if短路，不重复转换
         */
        if (typeof headerValue.start === "string") {
            headerValue.start = this.storageStringInputToNumber(headerValue.start);
            headerValue.end = this.storageStringInputToNumber(headerValue.end);
        }
        return this.minMaxNumberFilterFunction(headerValue, rowValue, rowdata, filterparams)
    }

    minMaxNetworkFilterFuncion(headerValue: any, rowValue: any, rowdata: any, filterparams: any): boolean {
        if (typeof headerValue.start === "string") {
            headerValue.start = this.storageStringInputToNumber(headerValue.start.replace("ps", "")); // 利用以下storage的逻辑
            headerValue.end = this.storageStringInputToNumber(headerValue.end.replace("ps", ""));
        }
        return this.minMaxNumberFilterFunction(headerValue, rowValue, rowdata, filterparams)
    }

    storageStringInputToNumber(headerValue: string) {
        const units = ["mb", "gb", "tb"];
        const shortUnits = ["m", "g", "t"];

        let matches = headerValue.match(/^(\d*\.?\d+)(\D+)$/);

        if (matches) {
            const numericPart: number = parseFloat(matches[1]); // 数字部分
            const unitPart: string = (matches[2] as string).toLowerCase(); // 非数字部分

            if (numericPart <= 0)
                return 0
            if (units.includes(unitPart))
                return VpsData.convertStorageValue(numericPart, unitPart)
            if (shortUnits.includes(unitPart))
                return VpsData.convertStorageValue(numericPart, unitPart + "b")
        }
        return 0;
    }
}
import ReactDomServer from 'react-dom/server';