import { Request, Response } from 'express';
import { CategoryProduct, Product } from '@smodel/index';
import catchAsync from '@sexceptions/CatchAsync';
import { saveLogAdmin } from '@sservice/index';

export const categoryProductCreate = catchAsync(async (req: Request, res: Response) => {
    await new CategoryProduct(req.body).save();
    const admin = req.body.cmsAdminUser;
    await saveLogAdmin({
        name: `thêm mới danh mục`,
        type: 'create',
        key: 'product',
        user_id: admin._id,
        user_name: admin.name,
        user_email: admin.email,
        group_id: req.body.group_id,
        store_id: req.body.store_id,
        order_id: req.body.name,
    });
    res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const categoryProductUpdate = catchAsync(async (req: Request, res: Response) => {
    const { category_id } = req.params;
    const { group_id, store_id } = req.body;
    delete req.body.group_id;
    delete req.body.store_id;
    const data = await CategoryProduct.findByIdAndUpdate(category_id, req.body);
    if (data) {
        const admin = req.body.cmsAdminUser;
        await saveLogAdmin({
            name: `sửa danh mục`,
            type: 'edit',
            key: 'product',
            user_id: admin._id,
            user_name: admin.name,
            user_email: admin.email,
            group_id,
            store_id,
            order_id: req.body.name,
        });
    }
    res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const categoryProductDelete = catchAsync(async (req: Request, res: Response) => {
    const { category_id } = req.params;
    const data = await Product.findOne({ category_id });
    if (data) {
        return res.status(400).json({
            errorCode: 4000,
            message: 'Tồn tại sản phẩm của danh mục này',
        });
    }
    const cate = await CategoryProduct.findByIdAndDelete(category_id);
    if (cate) {
        const admin = req.body.cmsAdminUser;
        await saveLogAdmin({
            name: `xoá danh mục`,
            type: 'delete',
            key: 'product',
            order_id: cate?.name as string,
            user_id: admin._id,
            user_name: admin.name,
            user_email: admin.email,
            group_id: req.body.group_id,
            store_id: req.body.store_id,
        });
    }
    return res.status(200).json({
        errorCode: 0,
        message: 'success',
    });
});

export const categoryProductIndex = catchAsync(async (req: Request, res: Response) => {
    const { group_id, store_id } = req.query;
    const data = await CategoryProduct.find({ group_id, store_id }).sort('order');
    res.status(200).json({
        errorCode: 0,
        message: 'success',
        data,
    });
});
