
export class VpsData {

    static units: Array<{ unit: string, value: number }> = [
        { unit: 'mb', value: 1 },
        { unit: 'gb', value: 1024 },
        { unit: 'tb', value: 1024 * 1024 },
    ];

    static networkUnits: Array<{ unit: string, value: number }> = [
        { unit: 'mbps', value: 1 },
        { unit: 'gbps', value: 1024 },
        { unit: 'tbps', value: 1024 * 1024 },
    ];

    id: number;
    url: string;
    sales: string;
    product: string;
    status: string;
    age: number;
    lastAge: number;
    cpuType: string;
    cpuManufacturer: string;
    cpuInfo: string;
    cpuCores: number;
    drive: number;
    ram: number;
    bandwidth: number;
    network: number;
    avgPrice: number;

    constructor(id: number, data: any) {

        this.id = id;
        this.url = data.url;
        this.sales = data.sales;
        this.product = data.product;
        this.status = data.status;
        this.age = parseInt(data.status.age);
        this.lastAge = parseInt(data.status.lastAge);

        const cpu = data.spec.cpu;
        if (cpu) {
            this.cpuType = data.spec.cpu.type;
            this.cpuManufacturer = data.spec.cpu.mfr;
            this.cpuInfo = data.spec.cpu.info;
            this.cpuCores = data.spec.cpu.cores;

        }
        else {
            this.cpuType = "unknown";
            this.cpuManufacturer = "unknown";
            this.cpuInfo = "unknown";
            this.cpuCores = 0;
        }

        const drive = data.spec.drive;
        if (drive)
            this.drive = VpsData.convertStorageValue(drive.value, drive.unit);
        else
            this.drive = 0;

        const ram = data.spec.ram;
        if (ram)
            this.ram = VpsData.convertStorageValue(data.spec.ram.value, data.spec.ram.unit);
        else
            this.ram = 0;

        const bandwidth = data.spec.bandwidth;
        if (bandwidth)
            this.bandwidth = VpsData.convertStorageValue(data.spec.bandwidth.value, data.spec.bandwidth.unit);
        else
            this.bandwidth = 0;

        const network = data.spec.network;
        if (network)
            this.network = VpsData.convertNetworkValue(data.spec.network.value, data.spec.network.unit);
        else
            this.network = 0;

        this.avgPrice = VpsData.getAvgPricing(data.pricing)
    }

    static getAvgPricing(pricings: { [key: string]: any }) {
        if (!pricings)
            return NaN
        const billingCycles: Array<{ name: string; months: number }> = [
            { name: "monthly", months: 1 },
            { name: "quarterly", months: 3 },
            { name: "semiannually", months: 6 },
            { name: "annually", months: 12 },
            { name: "biennially", months: 24 },
            { name: "triennially", months: 36 },
        ]
        for (let cycle of billingCycles)
            if (cycle.name in pricings)
                return pricings[cycle.name] / cycle.months
        return NaN
    }

    static convertStorageValue(value: number, fromUnit: string, toUnit: string = 'mb'): number {
        return this.convertValue(value, fromUnit, toUnit, this.units);
    }

    static convertStorageToMaxUnit(value: number, unit: string = 'mb'): { value: number; unit: string } {
        return this.convertToMaxValue(value, unit, this.units);
    }


    static convertNetworkValue(value: number, fromUnit: string, toUnit: string = 'mbps'): number {
        // return this.convertStorageValue(value, fromUnit.replace("ps", ""), toUnit.replace("ps", ""));

        return this.convertValue(value, fromUnit, toUnit, this.networkUnits);
    }

    static convertNetworkToMaxUnit(value: number, unit: string = 'mbps'): { value: number; unit: string } {
        // let result = this.convertStorageToMaxUnit(value, unit.replace("ps", ""));
        // result.unit += "ps";
        // return result;
        return this.convertToMaxValue(value, unit, this.networkUnits);
    }

    static convertValue(value: number, fromUnit: string, toUnit: string, units: Array<{ unit: string, value: number }>) {
        if (fromUnit == "unmetered")
            return Number.MAX_VALUE;
        if (!value || !fromUnit)
            return 0;

        let from = units.find(el => el.unit == fromUnit);
        let to = units.find(el => el.unit == toUnit);
        if (!from || !to) {
            console.log(fromUnit)
            console.log(toUnit)
            throw new Error('Invalid unit');
        }
        return (value * from.value) / to.value;
    }

    static convertToMaxValue(value: number, unit: string, units: Array<{ unit: string, value: number }>): { value: number; unit: string } {
        if (value == Number.MAX_VALUE)
            return { value: Number.MAX_VALUE, unit: "unmetered" }
        if (value == 0)
            return { value: 0, unit: "unknown" }

        const unitIndex = units.findIndex(el => el.unit === unit);
        const unitCorrection = units[unitIndex].value;

        let last = units[0];
        for (let i: number = unitIndex; i < units.length; i++) {
            if (value / (units[i].value / unitCorrection) < 1)
                break;
            last = units[i]
        }

        return {
            value: parseFloat((value / (last.value / unitCorrection)).toFixed(1)),
            unit: last.unit
        };
    }
}