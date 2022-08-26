import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Payment, Department, Store, SubDepartment, CategoryProduct, Product } from '@smodel/index';
import { randomString } from '@shelpers/index';
import { ROLE_SUPER_ADMIN } from '@sconfig/app';
import catchAsync from '@sexceptions/CatchAsync';

const sampleData = catchAsync(async (req: Request, res: Response) => {
    const { group_id, store_id, init_product, init_payment, init_department } = req.body;
    const store = await Store.findById(store_id);
    if (store) {
        if (init_department) {
            const department = [
                {
                    name: 'Tầng',
                    sub: [
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                    ],
                },
                {
                    name: 'Tầng',
                    sub: [
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                    ],
                },
                {
                    name: 'Tầng',
                    sub: [
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                    ],
                },
                {
                    name: 'Tầng',
                    sub: [
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                    ],
                },
                {
                    name: 'Tầng',
                    sub: [
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                        {
                            name: 'Bàn',
                        },
                    ],
                },
            ];
            await Department.remove({ store_id });
            await SubDepartment.remove({ store_id });
            department.forEach(async (item, index: number) => {
                const departmentStore = await new Department({
                    name: `${item.name} ${index + 1}`,
                    desc: `${item.name} ${index + 1}`,
                    store_id,
                }).save();
                item.sub.forEach(async (element, i: number) => {
                    const sub_department = await new SubDepartment({
                        name: `${element.name} ${i + 1}`,
                        desc: `${element.name} ${i + 1}`,
                        chair: Math.floor(Math.random() * Math.floor(10)),
                        department_id: departmentStore._id,
                        id: `${store.id}-${randomString(6)}`,
                        store_id,
                    }).save();
                    const departmentStoreUpdate = await Department.findById(sub_department.department_id);
                    if (departmentStoreUpdate) {
                        departmentStoreUpdate.subDepartment.push(sub_department._id);
                        await departmentStoreUpdate.save();
                    }
                });
            });
        }
        if (init_product) {
            const category = [
                {
                    name: 'CÀ PHÊ VIỆT NAM',
                    product: [
                        {
                            name: 'BẠC SỈU',
                            desc:
                                'Theo chân những người gốc Hoa đến định cư tại Sài Gòn, Bạc sỉu là cách gọi tắt của "Bạc tẩy sỉu phé" trong tiếng Quảng Đông, chính là: Ly sữa trắng kèm một chút cà phê.',
                            price: 32000,
                            logo:
                                'https://product.hstatic.net/1000075078/product/bac-siu_13856adaa2354499aa61251b8b1e9fd6_large.jpg',
                        },
                        {
                            name: 'CÀ PHÊ ĐEN',
                            desc:
                                'Một tách cà phê đen thơm ngào ngạt, phảng phất mùi cacao là món quà tự thưởng tuyệt vời nhất cho những ai mê đắm tinh chất nguyên bản nhất của cà phê. Một tách cà phê trầm lắng, thi vị giữa dòng đời vồn vã.',
                            price: 32000,
                            logo:
                                'https://product.hstatic.net/1000075078/product/cafe-den-da_18234c186f2f44f0a2d7ec1ce0e58158_large.jpg',
                        },
                    ],
                },
                {
                    name: 'CÀ PHÊ MÁY',
                    product: [
                        {
                            name: 'AMERICANO',
                            desc:
                                'Americano được pha chế bằng cách thêm nước vào một hoặc hai shot Espresso để pha loãng độ đặc của cà phê, từ đó mang lại hương vị nhẹ nhàng, không gắt mạnh và vẫn thơm nồng nàn.',
                            price: 39000,
                            logo:
                                'https://product.hstatic.net/1000075078/product/americano-da_7495646eaad24b8cbe0e68e8e479f01f_large.jpg',
                        },
                        {
                            name: 'CAPPUCCINO',
                            desc:
                                'Cappuccino được gọi vui là thức uống "một-phần-ba" - 1/3 Espresso, 1/3 Sữa nóng, 1/3 Foam.',
                            price: 45000,
                            logo:
                                'https://product.hstatic.net/1000075078/product/capu-nong_a2a47a422fa94e8194e9d4c4badba9d3_large.jpg',
                        },
                    ],
                },
                {
                    name: 'COLD BREW',
                    product: [
                        {
                            name: 'COLD BREW TRUYỀN THỐNG',
                            desc:
                                'Trong một năm trở lại đây, cà phê pha lạnh Cold Brew đã trở thành một xu hướng thưởng thức mới đối với các tín đồ cà phê Việt Nam.',
                            price: 45000,
                            logo:
                                'https://product.hstatic.net/1000075078/product/cold-brew-classic_0627eece2e014fa1aeacb724e954011d_large.jpg',
                        },
                        {
                            name: 'COLD BREW PHÚC BỒN TỬ',
                            desc:
                                'Một sự kết hợp đầy thuyết phục cho những người thích cà phê nhưng lại muốn thay đổi vị. Vị chua ngọt của trái phúc bồn tử',
                            price: 50000,
                            logo:
                                'https://product.hstatic.net/1000075078/product/cold-brew-pbt_5fb45e24ca6243f894ef45797fbebe7e_large.jpg',
                        },
                    ],
                },
                {
                    name: 'TRÀ TRÁI CÂY',
                    product: [
                        {
                            name: 'TRÀ TRÁI VẢI',
                            desc:
                                'Là thức uống "bắt vị" được lấy cảm hứng từ trái Vải - thức quả tròn đầy, quen thuộc trong cuộc sống người Việt - kết hợp cùng Trà làm từ những lá trà tươi hảo hạng.',
                            price: 45000,
                            logo:
                                'https://product.hstatic.net/1000075078/product/tra-vai_5da7600555ff48d6825a71b396cecd7a_large.jpg',
                        },
                        {
                            name: 'TRÀ HẠT SEN',
                            desc:
                                'Sự kết hợp của Trà hương thơm nhẹ, vị nồng hậu cùng Hạt sen tươi mềm có vị ngọt, sáp, vừa ngon miệng vừa có tác dụng an thần, tốt cho cơ thể.',
                            price: 45000,
                            logo:
                                'https://product.hstatic.net/1000075078/product/tra-hat-sen_66a4b5d319314b408021b3765e07a003_large.jpg',
                        },
                    ],
                },
                {
                    name: 'TRÀ SỮA MACCHIATO',
                    product: [
                        {
                            name: 'TRÀ MATCHA MACCHIATO',
                            desc:
                                'Bột trà xanh Matcha thơm lừng hảo hạng cùng lớp Macchiato béo ngậy là một sự kết hợp tuyệt vời.',
                            price: 45000,
                            logo:
                                'https://product.hstatic.net/1000075078/product/matcha-macchiato_c37b0e0c1c714d0091ee4f3052088193_large.jpg',
                        },
                        {
                            name: 'TRÀ LÀI MACCHIATO',
                            desc:
                                'Ngay ngụm đầu tiên chính là vị beo béo ngọt dịu của lớp macchiato, sau đó được cân bằng lại bởi lớp thanh mát từ nền trà lài dịu nhẹ - 1 hương vị tươi mới cho team hảo ngọt nhưng thích thanh mát.',
                            price: 42000,
                            logo:
                                'https://product.hstatic.net/1000075078/product/tra-lai-macchiato_00463a9c222b468bad078909a5ee2838_large.jpg',
                        },
                    ],
                },
            ];
            await CategoryProduct.remove({ group_id, store_id });
            await Product.remove({ group_id, store_id });
            category.forEach(async (item) => {
                const cate = await new CategoryProduct({ name: item.name, group_id, store_id, desc: item.name }).save();
                item.product.forEach(async (element) => {
                    await new Product({
                        name: element.name,
                        desc: element.desc,
                        price: element.price,
                        logo: element.logo,
                        category_id: cate._id,
                        group_id,
                        store_id,
                    }).save();
                });
            });
        }
        if (init_payment) {
            await Payment.remove({ group_id, store_id });
            await Payment.insertMany([
                {
                    active: false,
                    code: 'EWALLET',
                    desc: 'Thanh toán qua Ví Appota',
                    name: 'Ví Appota',
                    group_id,
                    store_id,
                },
                {
                    active: false,
                    code: 'MONEY',
                    desc: 'Thanh toán bằng tiền mặt',
                    name: 'Tiền mặt',
                    group_id,
                    store_id,
                },
                {
                    active: false,
                    code: 'ATM',
                    desc: 'Thẻ ATM / Bank Online',
                    name: 'Thẻ ATM',
                    group_id,
                    store_id,
                },
                {
                    active: false,
                    code: 'CC',
                    desc: 'Visa, MasterCard, JCB',
                    name: 'Thẻ tín dụng / Ghi nợ',
                    group_id,
                    store_id,
                },
            ]);
        }
        return res.status(200).json({
            errorCode: 0,
            message: 'success',
        });
    }
    return res.status(404).json({
        errorCode: 404,
        message: 'Không tồn tại cửa hàng',
    });
});

const getLog = catchAsync(async (_req: Request, res: Response) => {
    // const admin = req.body.cmsAdminUser;
    // if (admin.role === ROLE_SUPER_ADMIN) {
    const data = await fs.readFileSync(`${path.resolve()}/server/storage/logs/node.log`);
    res.header('Content-Type', 'application/json; charset=utf-8');
    return res.end(data);
    // }
    return res.end('');
});

const deleteLog = catchAsync(async (req: Request, res: Response) => {
    const admin = req.body.cmsAdminUser;
    if (admin.role === ROLE_SUPER_ADMIN) {
        fs.writeFileSync(`${path.resolve()}/server/storage/logs/node.log`, '');
        res.end('Delete file success');
    }
    return res.end('');
});

export { getLog, deleteLog, sampleData };
