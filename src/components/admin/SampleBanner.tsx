import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getCategory } from 'reduxStore/category/actions';
import { getPaymentMethods } from 'reduxStore/paymentMethods/actions';
import { Alert, Space, Button, Steps, Checkbox, message } from 'antd';
import { LoadingOutlined, CheckOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import Modal from 'components/admin/Modal';
import Link from 'next/link';
import { setSampleProducts } from 'api/store';
import { parseCookies } from 'nookies';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { Step } = Steps;

const SampleBanner = () => {
    const { group_id, store_id } = parseCookies();

    const dispatch = useDispatch();

    const [isShowModal, setIsShowModal] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [initProduct, setInitProduct] = useState<boolean>(false);
    const [completeImportCategoryProduct, setCompleteImportCategoryProduct] = useState<number>(0);
    const [initPayment, setInitPayment] = useState<boolean>(false);
    const [completeImportPayment, setCompleteImportPayment] = useState<number>(0);
    const [initDepartment, setInitDepartment] = useState<boolean>(false);
    const [completeImportDepartment, setCompleteImportDepartment] = useState<number>(0);

    const showModal = () => {
        setIsShowModal((prevIsShowModal) => !prevIsShowModal);
    };

    const handleImportProducts = async () => {
        try {
            if (!initProduct && !initPayment) {
                message.error('Vui lòng chọn ít nhất một loại dữ liệu mẫu');
                return;
            }
            setLoading(true);
            if (initProduct) {
                setCompleteImportCategoryProduct(1);
                setTimeout(() => {
                    setCompleteImportCategoryProduct(2);
                }, 1500);
            }
            if (initPayment) {
                setCompleteImportPayment(1);
                setTimeout(() => {
                    setCompleteImportPayment(2);
                }, 3000);
            }
            if (initDepartment) {
                setCompleteImportDepartment(1);
                setTimeout(() => {
                    setCompleteImportDepartment(2);
                }, 4500);
            }
            setTimeout(
                () => {
                    setLoading(false);
                    setCurrentStep(1);
                },
                initProduct && initPayment && initDepartment
                    ? 4500
                    : initProduct && initPayment
                    ? 3000
                    : (initProduct && initDepartment) || (initPayment && initDepartment)
                    ? 4500
                    : initProduct
                    ? 1500
                    : initPayment
                    ? 3000
                    : 4500,
            );
            await setSampleProducts({
                init_product: initProduct,
                init_payment: initPayment,
                init_department: initDepartment,
                group_id,
                store_id,
            });
        } catch (err) {
            setLoading(false);
            message.error(err.message);
        }
    };

    const handleCheckboxInitProduct = (e: CheckboxChangeEvent) => {
        setInitProduct(e.target.checked);
    };

    const handleCheckboxInitPayment = (e: CheckboxChangeEvent) => {
        setInitPayment(e.target.checked);
    };

    const handleCheckboxInitDepartment = (e: CheckboxChangeEvent) => {
        setInitDepartment(e.target.checked);
    };

    const handleSkipFirstStep = () => {
        setCurrentStep(1);
    };

    useEffect(() => {
        if (!isShowModal) {
            dispatch(getCategory(group_id, store_id));
            dispatch(getPaymentMethods(group_id, store_id));
        }
    }, [isShowModal]);

    return (
        <>
            <Alert
                message="Chào mừng bạn đến với Wifi cà Phê"
                showIcon
                closable
                description={
                    <>
                        <div>Chúng tôi đã tập hợp sẵn một số liên kết để bạn có thể bắt đầu ngay</div>
                        <Button style={{ marginTop: 10 }} onClick={showModal} type="primary">
                            Bắt đầu
                        </Button>
                    </>
                }
                type="info"
            />
            <Modal isShowModal={isShowModal} hideModal={showModal}>
                <Steps direction="vertical" current={currentStep}>
                    <Step
                        title="Thêm dữ liệu mẫu"
                        description={
                            <>
                                <p>
                                    <WarningOutlined style={{ color: 'orange' }} /> Khi thêm dữ liệu mẫu, hệ thống sẽ
                                    reset dữ liệu đang có, bạn hãy chắc chắn kiểm tra lại dữ liệu khi thêm
                                </p>
                                <div style={{ lineHeight: 2 }}>
                                    <div>
                                        {completeImportCategoryProduct === 0 ? (
                                            <Checkbox
                                                checked={initProduct}
                                                onChange={handleCheckboxInitProduct}
                                                disabled={!!currentStep}
                                            >
                                                Sản phẩm và danh mục
                                            </Checkbox>
                                        ) : completeImportCategoryProduct === 1 ? (
                                            <>
                                                <LoadingOutlined /> Sản phẩm và danh mục
                                            </>
                                        ) : (
                                            <>
                                                <CheckOutlined style={{ color: 'green' }} /> Sản phẩm và danh mục
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        {completeImportPayment === 0 ? (
                                            <Checkbox
                                                checked={initPayment}
                                                onChange={handleCheckboxInitPayment}
                                                disabled={!!currentStep}
                                            >
                                                Phương thức thanh toán
                                            </Checkbox>
                                        ) : completeImportPayment === 1 ? (
                                            <>
                                                <LoadingOutlined /> Phương thức thanh toán
                                            </>
                                        ) : (
                                            <>
                                                <CheckOutlined style={{ color: 'green' }} /> Phương thức thanh toán
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        {completeImportDepartment === 0 ? (
                                            <Checkbox
                                                checked={initDepartment}
                                                onChange={handleCheckboxInitDepartment}
                                                disabled={!!currentStep}
                                            >
                                                Phòng / bàn
                                            </Checkbox>
                                        ) : completeImportDepartment === 1 ? (
                                            <>
                                                <LoadingOutlined /> Phòng / bàn
                                            </>
                                        ) : (
                                            <>
                                                <CheckOutlined style={{ color: 'green' }} /> Phòng / bàn
                                            </>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    loading={loading}
                                    disabled={currentStep !== 0}
                                    type="primary"
                                    onClick={handleImportProducts}
                                    icon={<PlusOutlined />}
                                    style={{ marginTop: 10 }}
                                >
                                    Thêm dữ liệu mẫu
                                </Button>
                                <Button
                                    style={{ marginLeft: 10 }}
                                    disabled={currentStep !== 0}
                                    type="text"
                                    danger
                                    onClick={handleSkipFirstStep}
                                >
                                    Bỏ qua
                                </Button>
                            </>
                        }
                    />
                    <Step
                        title="Cài đặt cửa hàng"
                        description={
                            <Space>
                                <Button disabled={currentStep !== 1} style={{ marginTop: 10 }} type="primary">
                                    <Link href="/admin/config">
                                        <a>Cài đặt chuỗi & thanh toán</a>
                                    </Link>
                                </Button>
                                {/* <Button disabled={currentStep !== 1} style={{ marginTop: 10 }} type="primary">
                                    <Link href="/admin/config">
                                        <a>Cài đặt cửa hàng</a>
                                    </Link>
                                </Button> */}
                                {/* <div>
                                    <Link href="/admin/config">
                                        <a>Cài đặt chuỗi</a>
                                    </Link>
                                </div>
                                <div>
                                    <Link href="/admin/config">
                                        <a>Cài đặt cửa hàng</a>
                                    </Link>
                                </div> */}
                            </Space>
                        }
                    />
                </Steps>
            </Modal>
        </>
    );
};

export default SampleBanner;
