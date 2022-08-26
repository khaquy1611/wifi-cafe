import moment from 'moment';
import { AdminInfoDataType } from 'api/types';

export const availableLinks = (loginData?: AdminInfoDataType) => {
    return loginData?.role !== 'ADMIN'
        ? '/admin/dashboard'
        : [
              '/admin/dashboard',
              '/admin/sales/orders',
              '/admin/stores/department',
              '/admin/products/category',
              '/admin/customer',
          ].find((item) => loginData?.permissions.find((elem) => item.includes(elem))) || '/login';
};

export const listPermissions = () => [
    {
        value: [
            '/api/customer/create:POST',
            '/api/customer/:customerId:PUT',
            '/api/customer/list:GET',
            '/api/customer/info/:customerId:GET',
            '/api/customer/history/order/:customerId:GET',
        ],
        desc: ['Quản lý khách hàng'],
        key: 'customer',
        label: 'Quản lý khách hàng',
    },
    {
        value: [
            '/api/stat/order/today:GET',
            '/api/stat/order/type:GET',
            '/api/stat/order/overview:GET',
            '/api/stat/order/overview/user:GET',
            '/api/stat/order/product:GET',
            '/api/stat/order/customer:GET',
            '/api/stat/order/user:GET',
            '/api/products:GET',
            '/api/payment/method:GET',
            '/api/stat/order/user:GET',
        ],
        desc: ['Báo cáo - Thống kê'],
        key: 'dashboard',
        label: 'Báo cáo - Thống kê',
    },
    {
        value: [
            '/api/log/notify:GET',
            '/api/log/notify/:notifyId:PUT',
            '/api/products/category:GET',
            '/api/products:GET',
            '/api/stores/department:GET',
            '/api/stores/department/sub/:subDeparmentId/status:PUT',
            '/api/stores/department/sub/change/table:POST',
            '/api/stores/department/sub:GET',
            '/api/orders/create/by/admin:POST',
            '/api/orders/:orderId:PUT',
            '/api/orders/update/quantity/product/:productId:PUT',
            '/api/orders/:orderId/status:PUT',
            '/api/orders/:orderId:GET',
            '/api/orders:GET',
            '/api/orders/cms/list:GET',
            '/api/payment/method:GET',
            '/api/customer/create:POST',
            '/api/push/notify/user:POST',
            '/api/customer/list:GET',
        ],
        desc: ['Bán hàng'],
        key: 'sales',
        label: 'Bán hàng',
    },
    {
        value: [
            '/api/stores/department/create:POST',
            '/api/stores/department/:deparmentId:PUT',
            '/api/stores/department/:deparmentId:DELETE',
            '/api/stores/department:GET',
            '/api/stores/department/sub/create:POST',
            '/api/stores/department/sub/:subDeparmentId:PUT',
            '/api/stores/department/sub/:subDeparmentId:DELETE',
            '/api/stores/department/sub:GET',
        ],
        desc: [
            'Tạo mới phòng/tầng',
            'Sửa phòng/tầng',
            'Danh sách phòng/tầng',
            'Tạo mới bàn',
            'Sửa bàn',
            'Danh sách bàn',
        ],
        key: 'department',
        label: 'Quản lý phòng/bàn',
    },
    {
        value: [
            '/api/products/category/create:POST',
            '/api/products/category/:category_id:PUT',
            '/api/products/category/:category_id:DELETE',
            '/api/products/category:GET',
            '/api/products/create:POST',
            '/api/products/:productId:PUT',
            '/api/products/:productId:DELETE',
            '/api/products:GET',
            '/api/upload/file:POST',
            '/api/upload/file/:fileId:DELETE',
            '/api/upload/file:GET',
            '/api/coupons:GET',
            '/api/coupons/create:POST',
            '/api/coupons/:couponId:PUT',
            '/api/products/import:POST',
            '/api/products/:productId:GET',
            '/api/ware-house:GET',
            '/api/ware-house:POST',
            '/api/ware-house/:id:PUT',
            '/api/ware-house/:id:DELETE',
            '/api/ware-house/import:POST',
            '/api/receipt-type:GET',
            '/api/receipt-type:POST',
            '/api/receipt:GET',
            '/api/receipt:POST',
            '/api/receipt/:id:PUT',
            '/api/receipt/:id:GET',
            '/api/receipt/export-pdf/:id:GET',
            '/api/receipt/update-status/:id:PUT',
        ],
        desc: [
            'Tạo mới danh mục',
            'Sửa danh mục',
            'Danh sách danh mục',
            'Tạo mới sản phẩm',
            'Sửa sản phầm',
            'Danh sách sản phẩm',
            'Mã khuyến mãi',
            'Quản lý kho hàng',
            'Quản lý nguyên liệu',
        ],
        key: 'product',
        label: 'Quản lý sản phẩm / kho hàng',
    },
    {
        value: ['/api/report/ware-house:GET'],
        desc: ['Báo cáo'],
        key: 'report',
        label: 'Báo cáo',
    },
];

export const sizeMemory = (size: number, page = 2) => {
    if (size < 0) {
        return '';
    }
    if (size === 0) {
        return `${0} B`;
    }
    if (size < 1024) {
        return `${size.toFixed(0)} B`;
    }
    if (size >= 1024 && size < 1024 * 1024) {
        return `${(size / 1024).toFixed(page)} KB`;
    }
    if (size >= 1024 * 1024 && size < 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(page)} MB`;
    }
    if (size >= 1024 * 1024 * 1024 && size < 1024 * 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024 * 1024)).toFixed(page)} GB`;
    }
    if (size >= 1024 * 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024 * 1024 * 1024)).toFixed(page)} TB`;
    }
    return '';
};

export const listBank = () => {
    return [
        {
            name: 'Vietcombank',
            code: 'VCB',
        },
        {
            name: 'Techcombank',
            code: 'TECHCOMBANK',
        },
        {
            name: 'TienphongBank',
            code: 'TPBANK',
        },
        {
            name: 'Vietinbank',
            code: 'VIETINBANK',
        },
        {
            name: 'VIBank',
            code: 'VIB',
        },
        {
            name: 'Dong A Bank',
            code: 'DAB',
        },
        {
            name: 'HD Bank',
            code: 'HDBANK',
        },
        {
            name: 'MB',
            code: 'MB',
        },
        {
            name: 'Việt Á Bank',
            code: 'VIETABANK',
        },
        {
            name: 'MARITIMEBANK',
            code: 'MARITIMEBANK',
        },
        {
            name: 'EximBank',
            code: 'EXIMBANK',
        },
        {
            name: 'SHB',
            code: 'SHB',
        },
        {
            name: 'VP Bank',
            code: 'VPBANK',
        },
        {
            name: 'AB Bank',
            code: 'ABBANK',
        },
        {
            name: 'Sacombank',
            code: 'SACOMBANK',
        },
        {
            name: 'Nam A Bank',
            code: 'NAMA',
        },
        {
            name: 'OceanBank',
            code: 'OCEANBANK',
        },
        {
            name: 'BIDV',
            code: 'BIDV',
        },
        {
            name: 'SeaBank',
            code: 'SEABANK',
        },
        {
            name: 'Ngân hàng Bắc A',
            code: 'BACA',
        },
        {
            name: 'NaviBank',
            code: 'NAVIBANK',
        },
        {
            name: 'Agribank',
            code: 'AGRIBANK',
        },
        {
            name: 'Ngân hàng TMCP Sài Gòn (SCB)',
            code: 'SAIGONBANK',
        },
        {
            name: 'PVcombank',
            code: 'PVBANK',
        },
        {
            name: 'Ngân hàng ACB',
            code: 'ACB',
        },
        {
            name: 'Ngân hàng Bưu Điện',
            code: 'LPB',
        },
        {
            name: 'Ngân hàng Bảo Việt',
            code: 'BVBANK',
        },
        {
            name: 'Ngân hàng Phương Đông (OCB)',
            code: 'OCB',
        },
        {
            name: 'Ngân hàng Kiên Long',
            code: 'KIENLONGBANK',
        },
        {
            name: 'Ngân hàng Việt Nga',
            code: 'VRB',
        },
        {
            name: 'Ngân hàng Quốc Dân',
            code: 'NCB',
        },
        {
            name: 'PG bank',
            code: 'PGBANK',
        },
        {
            name: 'GP Bank',
            code: 'GPBANK',
        },
    ];
};

export const listVisa = () => {
    return [
        {
            name: 'Thẻ Visa',
            code: 'VISA',
        },
        {
            name: 'Thẻ Master Card',
            code: 'MASTERCARD',
        },
        {
            name: 'Thẻ JCB',
            code: 'JCB',
        },
    ];
};

export const alphabeticalSortedQuery = (data: { [key: string]: unknown }) => {
    const alphabeticalSortedData: { [key: string]: string } = Object.keys(data)
        .sort()
        .reduce(
            (acc, key) => ({
                ...acc,
                [key]: typeof data[key] !== 'string' ? JSON.stringify(data[key]) : data[key],
            }),
            {},
        );

    const query = Object.keys(alphabeticalSortedData)
        .map((key) => {
            return `${key}=${alphabeticalSortedData[key]}`;
        })
        .join('&');

    return query;
};

export const convertDuration = (now: string, then: string) => {
    const ms = moment(now).diff(moment(then));
    const d = moment.duration(ms);
    const s = Math.floor(d.asHours()) + moment.utc(ms).format(':mm:ss');
    return s;
};

export const isPhoneNumberValid = (num: string) => {
    const regex = /(097|086|096|098|032|033|034|035|036|037|038|039|089|090|093|070|079|077|076|078|088|091|094|083|084|085|081|082|092|056|058|099|059)+([0-9]{7})\b/;
    return regex.test(num);
};

export const options = [
    {
        value: 'order',
        label: '-- Bán hàng',
    },
    {
        value: 'department',
        label: '-- Phòng / bàn',
    },
    {
        value: 'product',
        label: '-- Sản phẩm',
    },
    {
        value: 'image',
        label: '-- Hình ảnh',
    },
    {
        value: 'transfer',
        label: '-- Chuyển tiền',
    },
    {
        value: 'ware_house',
        label: '-- Kho hàng',
    },
];

export const renderTagStatus = (status: string) => {
    switch (status) {
        case 'import':
            return {
                color: 'success',
                label: 'Nhập kho',
            };
        case 'export':
            return {
                color: 'success',
                label: 'Xuất kho',
            };
        case 'order':
            return {
                color: 'processing',
                label: 'Đặt hàng',
            };
        default:
            return {
                color: 'error',
                label: 'Đã hủy',
            };
    }
};
