/* eslint-disable no-restricted-syntax */
import ErrorHandler from '@sexceptions/index';
import { WareHouse, ReceiptItem, ProductAttribute } from '@smodel/index';
import {
    ReceiptType,
    ReceiptItemInputType,
    WarehouseQueryConditionType,
    WarehouseResponseDataType,
    QuerySortType,
} from '@stypes/index';
import { map, pick } from 'lodash';
import moment from 'moment';
import WareHouseDailyLog from '@smodel/WareHouse/WareHouseDailyLog';
import ReceiptItemAttribute from '@smodel/WareHouse/ReceiptItemAttribute';

export const checkAndUpdateWareHouse = async ({
    group_id,
    list_products,
    orderId,
}: {
    group_id: string;
    list_products: { product_id: string; quantity: number }[];
    orderId: string;
}) => {
    try {
        const listProducts = map(list_products, 'product_id');
        const productAttributes: any = await ProductAttribute.find({ product_id: { $in: listProducts } }).populate({
            match: {
                group_id,
            },
            path: 'warehouse_id',
            select: '_id name unit group_id store_id type',
        });
        for (const item of productAttributes) {
            const product = list_products.find((p) => p.product_id === item.product_id.toString());
            if (item.warehouse_id?._id && product) {
                const sell_amount = Number((product.quantity * item.quantity).toFixed(3)) * -1;
                // eslint-disable-next-line no-await-in-loop
                const warehouse: any = await WareHouse.findById(item.warehouse_id._id);
                warehouse.sell_amount += sell_amount;
                // eslint-disable-next-line no-await-in-loop
                await warehouse.save();
                const receiptItem = new ReceiptItem({
                    ...pick(item.warehouse_id, ['name', 'unit', 'group_id', 'store_id']),
                    warehouse_type: item.warehouse_id.type,
                    warehouse_id: item.warehouse_id._id,
                    sell_amount,
                    orderId,
                    receipt_id: '',
                    code: '',
                    status: 'sell',
                    note: `Hoàn thành đơn hàng ${orderId}`,
                    time: moment().startOf('day').unix(),
                });
                // eslint-disable-next-line no-await-in-loop
                await receiptItem.save();
                // eslint-disable-next-line no-await-in-loop
                await recalculateDailyLog({
                    time: moment().startOf('day').unix(),
                    warehouse_id: item.warehouse_id._id,
                    status: 'sell',
                    amount: sell_amount,
                });
            }
        }
    } catch (e) {
        throw new ErrorHandler({ message: e.message, messageResponse: e.message });
    }
};

export const getContentPdf = async (receipt: ReceiptType, store_name: string, address: string) => {
    const createBy = receipt.list_operator.find(
        (item) => item.action === (receipt.type === 'import' ? 'order' : 'export'),
    );

    const importOrExportBy = receipt.list_operator.find(
        (item) => item.action === (receipt.type === 'import' ? 'import' : 'export'),
    );
    const date = moment(Number(createBy?.time) * 1000);

    const dataTable = [];
    if (receipt.link_warehouse.length > 0) {
        for (let i = 0; i < receipt.link_warehouse.length; i += 1) {
            dataTable.push([
                { text: i + 1, style: 'text' },
                { text: receipt.link_warehouse[i]?.name, style: 'text' },
                { text: receipt.link_warehouse[i]?.unit, style: 'text' },
                { text: receipt.link_warehouse[i]?.quantity, style: 'text_amount' },
            ]);
        }
    }

    const amount = receipt.link_warehouse.reduce((acc, item) => acc + item.quantity, 0);

    return {
        content: [
            {
                text: store_name,
                bold: true,
            },
            address,
            {
                text: `PHIẾU ${receipt.type === 'import' ? 'NHẬP' : 'XUẤT'} KHO`,
                style: 'title',
            },
            {
                text: `Ngày ${date.date()} tháng ${date.month() + 1} năm ${date.year()}`,
                style: 'sub_title',
            },
            {
                text: `Mã số: ${receipt.code}`,
                style: 'sub_title',
            },
            {
                columns: [
                    {
                        width: '20%',
                        text: `Người ${receipt.type === 'import' ? 'nhập' : 'xuất'} kho:`,
                        bold: true,
                    },
                    {
                        width: '*',
                        text: importOrExportBy?.name || '',
                    },
                ],
                columnGap: 10,
            },
            {
                columns: [
                    {
                        width: '20%',
                        text: 'Địa chỉ:',
                        bold: true,
                    },
                    {
                        width: '*',
                        text: address,
                    },
                ],
                columnGap: 10,
            },
            {
                columns: [
                    {
                        width: '20%',
                        text: 'Diễn giải:',
                        bold: true,
                    },
                    {
                        width: '*',
                        text: receipt.desc,
                    },
                ],
                columnGap: 10,
            },
            {
                style: 'table',
                table: {
                    headerRows: 1,
                    heights: 25,
                    widths: [80, '*', 100, 140],
                    body: [
                        [
                            { text: 'STT', style: 'text' },
                            { text: 'Nguyên vật liệu', style: 'text' },
                            { text: 'Đơn vị', style: 'text' },
                            { text: 'Số lượng', style: 'text' },
                        ],
                        ...dataTable,
                        [
                            {
                                text: `Tổng cộng:                      ${amount}`,
                                bold: true,
                                colSpan: 4,
                                alignment: 'right',
                                margin: [0, 0, 70, 0],
                            },
                        ],
                    ],
                },
                layout: {
                    fillColor(rowIndex: number) {
                        return rowIndex === 0 ? '#CCCCCC' : null;
                    },
                },
            },
            {
                text: '.......Ngày ..... tháng ..... năm .......',
                style: 'date',
            },
            {
                columns: [
                    {
                        width: '25%',
                        text: 'Người lập phiếu',
                        bold: true,
                        alignment: 'center',
                    },
                    {
                        width: '25%',
                        text: 'Người giao hàng ',
                        bold: true,
                        alignment: 'center',
                    },
                    {
                        width: '25%',
                        text: 'Thủ kho',
                        bold: true,
                        alignment: 'center',
                    },
                    {
                        width: '25%',
                        text: 'Kế toán trưởng',
                        bold: true,
                        alignment: 'center',
                    },
                ],
            },
            {
                columns: [
                    {
                        width: '25%',
                        text: '(Ký, họ tên) ',
                        alignment: 'center',
                    },
                    {
                        width: '25%',
                        text: '(Ký, họ tên) ',
                        alignment: 'center',
                    },
                    {
                        width: '25%',
                        text: '(Ký, họ tên) ',
                        alignment: 'center',
                    },
                    {
                        width: '25%',
                        text: '(Ký, họ tên) ',
                        alignment: 'center',
                    },
                ],
            },
        ],
        styles: {
            title: {
                fontSize: 23,
                bold: true,
                alignment: 'center',
                margin: [0, 30, 0, 20],
            },
            sub_title: {
                alignment: 'center',
                margin: [0, -10, 0, 20],
            },
            date: {
                alignment: 'right',
                margin: [0, -10, 0, 20],
            },
            table: {
                margin: [0, 20, 0, 20],
            },
            text: {
                alignment: 'center',
                margin: [0, 3, 0, 0],
            },
            text_amount: {
                alignment: 'right',
                margin: [0, 0, 70, 0],
            },
        },
    };
};

export const createReceiptItem = async ({
    data,
    status,
}: {
    data: ReceiptItemInputType;
    status: 'order' | 'cancel' | 'import' | 'export' | 'sell' | 'init' | 'delete';
}) => {
    const receiptItem = new ReceiptItem({
        ...data,
        status,
        note: status === 'init' ? 'Khởi tạo kho' : data.note,
        time: moment().startOf('day').unix(),
    });
    await receiptItem.save();
};

export const queryInventoryList = async ({
    condition,
    sort,
    skip,
    limit,
    status,
}: {
    condition: WarehouseQueryConditionType;
    sort: QuerySortType;
    skip?: number;
    limit?: number;
    status?: string;
}) => {
    const statusFilter = status ? { $match: { status } } : { $match: { status: { $exists: true } } };
    const result: WarehouseResponseDataType[] = await WareHouse.aggregate([
        {
            $match: condition,
        },
        {
            $project: {
                _id: 1,
                warehouse_id: '$_id',
                group_id: 1,
                store_id: 1,
                name: 1,
                amount: 1,
                min_amount: 1,
                unit: 1,
                warehouse_type: '$type',
                totalImport: '$import_amount',
                totalExport: '$export_amount',
                totalSell: '$sell_amount',
                createdAt: 1,
                updatedAt: 1,
                remainAmount: {
                    $add: ['$amount', '$import_amount', '$export_amount', '$sell_amount'],
                },
                status: {
                    $switch: {
                        branches: [
                            {
                                case: {
                                    $lte: [
                                        { $add: ['$amount', '$import_amount', '$export_amount', '$sell_amount'] },
                                        0,
                                    ],
                                },
                                then: 'empty',
                            },
                            {
                                case: {
                                    $gte: [
                                        { $add: ['$amount', '$import_amount', '$export_amount', '$sell_amount'] },
                                        '$min_amount',
                                    ],
                                },
                                then: 'enough',
                            },
                            {
                                case: {
                                    $lt: [
                                        { $add: ['$amount', '$import_amount', '$export_amount', '$sell_amount'] },
                                        '$min_amount',
                                    ],
                                },
                                then: 'low',
                            },
                        ],
                        default: 'enough',
                    },
                },
            },
        },
        {
            $sort: sort,
        },
        statusFilter,
        {
            $skip: skip,
        },
        {
            $limit: limit,
        },
    ]);
    return result;
};
export const queryInventoryStreamList = async ({
    condition,
    sort,
    status,
}: {
    condition: WarehouseQueryConditionType;
    sort: QuerySortType;
    status?: string;
}) => {
    const statusFilter = status ? { $match: { status } } : { $match: { status: { $exists: true } } };
    const result: WarehouseResponseDataType[] = await WareHouse.aggregate([
        {
            $match: condition,
        },
        {
            $project: {
                _id: 1,
                warehouse_id: '$_id',
                group_id: 1,
                store_id: 1,
                name: 1,
                amount: 1,
                min_amount: 1,
                unit: 1,
                warehouse_type: '$type',
                totalImport: '$import_amount',
                totalExport: '$export_amount',
                totalSell: '$sell_amount',
                createdAt: 1,
                updatedAt: 1,
                remainAmount: {
                    $add: ['$amount', '$import_amount', '$export_amount', '$sell_amount'],
                },
                status: {
                    $switch: {
                        branches: [
                            {
                                case: {
                                    $lte: [
                                        { $add: ['$amount', '$import_amount', '$export_amount', '$sell_amount'] },
                                        0,
                                    ],
                                },
                                then: 'empty',
                            },
                            {
                                case: {
                                    $gte: [
                                        { $add: ['$amount', '$import_amount', '$export_amount', '$sell_amount'] },
                                        '$min_amount',
                                    ],
                                },
                                then: 'enough',
                            },
                            {
                                case: {
                                    $lt: [
                                        { $add: ['$amount', '$import_amount', '$export_amount', '$sell_amount'] },
                                        '$min_amount',
                                    ],
                                },
                                then: 'low',
                            },
                        ],
                        default: 'enough',
                    },
                },
            },
        },
        {
            $sort: sort,
        },
        statusFilter,
    ])
        .cursor()
        .exec();
    return result;
};

export const queryReportList = async ({
    condition,
    timeFilter,
    sort,
    skip,
    limit,
    status,
    countTotal,
}: {
    condition: WarehouseQueryConditionType;
    timeFilter: any;
    sort: QuerySortType;
    skip?: number;
    limit?: number;
    status?: string;
    countTotal?: boolean;
}) => {
    const statusFilter = status ? { $match: { status } } : { $match: { status: { $exists: true } } };
    if (countTotal) {
        const result = await WareHouse.aggregate([
            {
                $match: condition,
            },
            {
                $lookup: {
                    from: 'warehouse_daily_log',
                    localField: '_id',
                    foreignField: 'warehouse_id',
                    as: 'daily_log',
                },
            },
            {
                $unwind: {
                    path: '$daily_log',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: timeFilter,
            },
            {
                $group: {
                    _id: {
                        daily_warehouse: '$daily_log.warehouse_id',
                        _id: '$_id',
                    },
                    group_id: {
                        $first: '$group_id',
                    },
                    store_id: {
                        $first: '$store_id',
                    },
                    name: {
                        $first: '$name',
                    },
                    min_amount: {
                        $first: '$min_amount',
                    },
                    amount: {
                        $first: '$amount',
                    },
                    warehouse_id: {
                        $first: '$_id',
                    },
                    unit: {
                        $first: '$unit',
                    },
                    warehouse_type: {
                        $first: '$type',
                    },
                    createdAt: {
                        $first: '$createdAt',
                    },
                    updatedAt: {
                        $first: '$updatedAt',
                    },
                    totalImport: {
                        $sum: '$daily_log.import_amount',
                    },
                    totalExport: {
                        $sum: '$daily_log.export_amount',
                    },
                    totalSell: {
                        $sum: '$daily_log.sell_amount',
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    warehouse_id: 1,
                    group_id: 1,
                    store_id: 1,
                    name: 1,
                    amount: 1,
                    min_amount: 1,
                    unit: 1,
                    warehouse_type: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    totalImport: 1,
                    totalExport: 1,
                    totalSell: 1,
                    remainAmount: {
                        $add: ['$amount', '$totalImport', '$totalExport', '$totalSell'],
                    },
                    status: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $lte: [{ $add: ['$amount', '$totalImport', '$totalExport', '$totalSell'] }, 0],
                                    },
                                    then: 'empty',
                                },
                                {
                                    case: {
                                        $gte: [
                                            { $add: ['$amount', '$totalImport', '$totalExport', '$totalSell'] },
                                            '$min_amount',
                                        ],
                                    },
                                    then: 'enough',
                                },
                                {
                                    case: {
                                        $lt: [
                                            { $add: ['$amount', '$totalImport', '$totalExport', '$totalSell'] },
                                            '$min_amount',
                                        ],
                                    },
                                    then: 'low',
                                },
                            ],
                            default: 'enough',
                        },
                    },
                },
            },
            statusFilter,
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                },
            },
        ]);
        return result.length ? result[0].count : 0;
    }
    const result: WarehouseResponseDataType[] = await WareHouse.aggregate([
        {
            $match: condition,
        },
        {
            $lookup: {
                from: 'warehouse_daily_log',
                localField: '_id',
                foreignField: 'warehouse_id',
                as: 'daily_log',
            },
        },
        {
            $unwind: {
                path: '$daily_log',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $match: timeFilter,
        },
        {
            $group: {
                _id: {
                    daily_warehouse: '$daily_log.warehouse_id',
                    _id: '$_id',
                },
                group_id: {
                    $first: '$group_id',
                },
                store_id: {
                    $first: '$store_id',
                },
                name: {
                    $first: '$name',
                },
                min_amount: {
                    $first: '$min_amount',
                },
                amount: {
                    $first: '$amount',
                },
                warehouse_id: {
                    $first: '$_id',
                },
                unit: {
                    $first: '$unit',
                },
                warehouse_type: {
                    $first: '$type',
                },
                createdAt: {
                    $first: '$createdAt',
                },
                updatedAt: {
                    $first: '$updatedAt',
                },
                totalImport: {
                    $sum: '$daily_log.import_amount',
                },
                totalExport: {
                    $sum: '$daily_log.export_amount',
                },
                totalSell: {
                    $sum: '$daily_log.sell_amount',
                },
            },
        },
        {
            $project: {
                _id: 0,
                warehouse_id: 1,
                group_id: 1,
                store_id: 1,
                name: 1,
                amount: 1,
                min_amount: 1,
                unit: 1,
                warehouse_type: 1,
                createdAt: 1,
                updatedAt: 1,
                totalImport: 1,
                totalExport: 1,
                totalSell: 1,
                remainAmount: {
                    $add: ['$amount', '$totalImport', '$totalExport', '$totalSell'],
                },
                status: {
                    $switch: {
                        branches: [
                            {
                                case: {
                                    $lte: [{ $add: ['$amount', '$totalImport', '$totalExport', '$totalSell'] }, 0],
                                },
                                then: 'empty',
                            },
                            {
                                case: {
                                    $gte: [
                                        { $add: ['$amount', '$totalImport', '$totalExport', '$totalSell'] },
                                        '$min_amount',
                                    ],
                                },
                                then: 'enough',
                            },
                            {
                                case: {
                                    $lt: [
                                        { $add: ['$amount', '$totalImport', '$totalExport', '$totalSell'] },
                                        '$min_amount',
                                    ],
                                },
                                then: 'low',
                            },
                        ],
                        default: 'enough',
                    },
                },
            },
        },
        {
            $sort: sort,
        },
        statusFilter,
        {
            $skip: skip,
        },
        {
            $limit: limit,
        },
    ]);
    return result;
};

export const queryStreamExportList = ({
    condition,
    timeFilter,
    sort,
    status,
}: {
    condition: WarehouseQueryConditionType;
    timeFilter: any;
    sort: QuerySortType;
    status?: string;
}) => {
    const statusFilter = status ? { $match: { status } } : { $match: { status: { $exists: true } } };
    const result = WareHouse.aggregate([
        {
            $match: condition,
        },
        {
            $lookup: {
                from: 'warehouse_daily_log',
                localField: '_id',
                foreignField: 'warehouse_id',
                as: 'daily_log',
            },
        },
        {
            $unwind: {
                path: '$daily_log',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $match: timeFilter,
        },
        {
            $group: {
                _id: {
                    daily_warehouse: '$daily_log.warehouse_id',
                    _id: '$_id',
                },
                group_id: {
                    $first: '$group_id',
                },
                store_id: {
                    $first: '$store_id',
                },
                name: {
                    $first: '$name',
                },
                min_amount: {
                    $first: '$min_amount',
                },
                amount: {
                    $first: '$amount',
                },
                warehouse_id: {
                    $first: '$_id',
                },
                unit: {
                    $first: '$unit',
                },
                warehouse_type: {
                    $first: '$type',
                },
                createdAt: {
                    $first: '$createdAt',
                },
                updatedAt: {
                    $first: '$updatedAt',
                },
                totalImport: {
                    $sum: '$daily_log.import_amount',
                },
                totalExport: {
                    $sum: '$daily_log.export_amount',
                },
                totalSell: {
                    $sum: '$daily_log.sell_amount',
                },
            },
        },
        {
            $project: {
                _id: 0,
                name: 1,
                amount: 1,
                min_amount: 1,
                unit: 1,
                totalImport: 1,
                totalExport: 1,
                totalSell: 1,
                remainAmount: {
                    $add: ['$amount', '$totalImport', '$totalExport', '$totalSell'],
                },
                status: {
                    $switch: {
                        branches: [
                            {
                                case: {
                                    $lte: [{ $add: ['$amount', '$totalImport', '$totalExport', '$totalSell'] }, 0],
                                },
                                then: 'empty',
                            },
                            {
                                case: {
                                    $gte: [
                                        { $add: ['$amount', '$totalImport', '$totalExport', '$totalSell'] },
                                        '$min_amount',
                                    ],
                                },
                                then: 'enough',
                            },
                            {
                                case: {
                                    $lt: [
                                        { $add: ['$amount', '$totalImport', '$totalExport', '$totalSell'] },
                                        '$min_amount',
                                    ],
                                },
                                then: 'low',
                            },
                        ],
                        default: 'enough',
                    },
                },
            },
        },
        {
            $sort: sort,
        },
        statusFilter,
    ])
        .cursor({ batchSize: 100 })
        .exec();
    return result;
};

export const recalculateDailyLog = async ({
    time,
    warehouse_id,
    status,
    amount,
}: {
    time: number;
    warehouse_id: string;
    status: 'import' | 'export' | 'sell';
    amount: number;
}) => {
    const warehouse = await WareHouse.findById(warehouse_id);
    if (warehouse) {
        const existed: any = await WareHouseDailyLog.findOne({
            group_id: warehouse.group_id,
            store_id: warehouse.store_id,
            warehouse_id: warehouse._id,
            time: moment.unix(Number(time)).startOf('days').unix(),
        });
        if (existed) {
            existed[`${status}_amount`] += amount;
            await existed.save();
        } else {
            await new WareHouseDailyLog({
                ...pick(warehouse, ['name', 'unit', 'group_id', 'store_id']),
                time: moment.unix(Number(time)).startOf('days').unix(),
                warehouse_type: warehouse.type as 'item' | 'ingredient',
                warehouse_id: warehouse._id,
                [`${status}_amount`]: amount,
            }).save();
        }
    }
};

export const createReceiptItemAttribute = async (
    input: {
        receipt_id: string;
        warehouse_id: string;
        quantity: number;
    }[],
) => {
    await ReceiptItemAttribute.insertMany(input);
};
