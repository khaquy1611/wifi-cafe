import { Request, Response } from 'express';
import catchAsync from '@sexceptions/CatchAsync';
import { queryReportList, queryStreamExportList } from '@sservice/index';
import { WarehouseQueryConditionType } from '@stypes/index';
import moment from 'moment';
import { randomString } from '@shelpers/index';
import Excel from 'exceljs';
import path from 'path';

export const list = catchAsync(async (req: Request, res: Response) => {
    const { page, from, to, type, group_id, store_id, limit = 10 } = req.query;
    if (from && to && Number(from) > Number(to)) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc',
        });
        return;
    }
    const timeStart = moment(Number(from) * 1000)
        .startOf('days')
        .unix();
    const timeEnd = moment(Number(to) * 1000)
        .endOf('days')
        .unix();
    const skip = page ? (Number(page) - 1) * Number(limit) : 0;
    const condition = {
        type,
        group_id: group_id as string,
        store_id: store_id as string,
    } as WarehouseQueryConditionType;
    const sort = { createdAt: -1 };
    const timeFilter =
        from && to
            ? {
                  $or: [
                      {
                          'daily_log.time': { $gte: Number(timeStart), $lte: Number(timeEnd) },
                      },
                      {
                          createdAt: {
                              $gte: moment.unix(Number(from)).startOf('days').toDate(),
                              $lte: moment.unix(Number(to)).endOf('days').toDate(),
                          },
                      },
                  ],
              }
            : { createdAt: { $exists: true } };
    const total = await queryReportList({
        condition,
        timeFilter,
        sort,
        skip,
        limit: Number(limit),
        status: req.query.status as string,
        countTotal: true,
    });
    const data = await queryReportList({
        condition,
        timeFilter,
        sort,
        skip,
        limit: Number(limit),
        status: req.query.status as string,
    });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
        total,
    });
});

export const exportsCSV = catchAsync(async (req: Request, res: Response) => {
    const { from, to, type, group_id, store_id } = req.query;
    if (from && to && Number(from) > Number(to)) {
        res.status(400).json({
            errorCode: 4000,
            message: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc',
        });
        return;
    }
    const timeStart = moment.unix(Number(from)).startOf('days').unix();
    const timeEnd = moment.unix(Number(to)).endOf('days').unix();
    const condition = {
        type,
        group_id: group_id as string,
        store_id: store_id as string,
    } as WarehouseQueryConditionType;
    const sort = { createdAt: -1 };
    const timeFilter =
        from && to
            ? {
                  $or: [
                      {
                          'daily_log.time': { $gte: Number(timeStart), $lte: Number(timeEnd) },
                      },
                      {
                          createdAt: {
                              $gte: moment.unix(Number(from)).startOf('days').toDate(),
                              $lte: moment.unix(Number(to)).endOf('days').toDate(),
                          },
                      },
                  ],
              }
            : { createdAt: { $exists: true } };
    const list = queryStreamExportList({
        condition,
        timeFilter,
        sort,
        status: req.query.status as string,
    });
    const fileName = randomString();
    const storagePath = `${path.resolve('server', 'storage')}/${fileName}.xlsx`;
    let doc;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('BÁO CÁO TỒN KHO');
    worksheet.columns = [
        { header: 'Tên nguyên liệu/ mặt hàng', key: 'name', width: 35 },
        { header: 'Đơn vị', key: 'unit', width: 20 },
        { header: 'Số lượng đầu kỳ', key: 'amount', width: 15 },
        { header: 'Số lượng bán', key: 'totalSell', width: 15 },
        { header: 'Thêm', key: 'totalImport', width: 15 },
        { header: 'Giảm', key: 'totalExport', width: 15 },
        { header: 'Tối thiểu', key: 'min_amount', width: 15 },
        { header: 'Số lượng cuối kỳ', key: 'remainAmount', width: 15 },
        { header: 'Trạng thái', key: 'status', width: 20 },
    ];
    // eslint-disable-next-line no-await-in-loop,no-cond-assign
    while ((doc = await list.next())) {
        doc.status = doc.status === 'low' ? 'Sắp hết hàng' : doc.status === 'empty' ? 'Hết hàng' : 'Còn hàng';
        worksheet.addRow(doc);
    }
    await workbook.xlsx.writeFile(storagePath);
    res.download(storagePath, 'bao_cao_nguyen_vat_lieu.xlsx');
});
