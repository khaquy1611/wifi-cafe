import express from 'express';

import Admin from './admin';
import Store from './stores/store';
import GroupStore from './stores/group';
import Department from './stores/department';
import Statistic from './statistic';
import Files from './file';
import Product from './products/product';
import Payment from './order/payment';
import Order from './order/order';
import LogNotify from './notify';
import AccountMiniApp from './miniapp/account';
import Customer from './customer';
import Coupons from './coupons';
import Client from './client';
import Transfer from './transfer';
import WareHouse from './warehouse';
import ReceiptType from './warehouse/receiptType';
import Receipt from './warehouse/receipt';
import Report from './report';

const router = express.Router();

router.use('/stat/order', Statistic);
router.use('/customer', Customer);
router.use('/coupons', Coupons);
router.use('/admin', Admin);
router.use('/upload/file', Files);
router.use('/stores', Store);
router.use('/group/stores', GroupStore);
router.use('/products', Product);
router.use('/stores/department', Department);
router.use('/log', LogNotify);
router.use('/orders', Order);
router.use('/payment', Payment);
router.use('/transfer', Transfer);
router.use('/ware-house', WareHouse);
router.use('/receipt-type', ReceiptType);
router.use('/receipt', Receipt);
router.use('/report', Report);

router.use('/', AccountMiniApp);

// API Client Page
router.use('/client', Client);

export default router;
