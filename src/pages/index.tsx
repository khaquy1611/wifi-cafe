/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from 'react';
import { Input, Button, Row, Col, Image, message } from 'antd';
import Link from 'next/link';
import axios from 'axios';
import wrapper from 'reduxStore';
import { parseCookies, destroyCookie, setCookie } from 'nookies';
import { useRouter } from 'next/router';
import { isPhoneNumberValid } from 'common';

import 'assets/home.less';

const Index = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [phone_number, setPhoneNumber] = useState<string>('');
    const router = useRouter();

    const submitForm = async () => {
        if (!phone_number) {
            message.warn('Vui lòng nhập số điện thoại');
            return;
        }
        const isValidPhoneNumber = isPhoneNumberValid(phone_number);
        if (!isValidPhoneNumber) {
            message.warn('Số điện thoại không hợp lệ');
            return;
        }

        setLoading(true);
        router.replace(router.asPath);
        setTimeout(() => {
            destroyCookie(null, 'phone_number');
            message.success('Bạn đã đăng ký thành công');
            setLoading(false);
            setPhoneNumber('');
        }, 1000);
    };

    const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneNumber(e.target.value);
        setCookie(null, 'phone_number', e.target.value, {
            path: '/',
        });
    };
    return (
        <div className="home-v1-wrapper">
            <div className="home-v1">
                <header>
                    <div className="container">
                        <div className="header-top clearfix">
                            <div className="logo float-left">
                                <a className="active" aria-current="page" data-target href="index.html">
                                    <Link href="/">
                                        <a>
                                            <Image src="/logo.svg" alt="Picture of the author" preview={false} />
                                        </a>
                                    </Link>
                                </a>
                            </div>
                            {/* <nav className="float-right">
                                <ul className="list-inline">
                                    <li className="list-inline-item active">
                                        <a href="faq.html">Hướng dẫn</a>
                                    </li>
                                    <li className="list-inline-item">
                                        <a href="price.html">Bảng giá</a>
                                    </li>
                                    <li className="list-inline-item">
                                        <a href="contact.html">Liên hệ</a>
                                    </li>
                                </ul>
                            </nav> */}
                        </div>
                    </div>
                </header>
                <div className="section register" id="formResiter">
                    <div className="container">
                        <div className="inner">
                            <div className="titleBlock">Giải pháp gọi món thông minh</div>
                            <p>
                                Wifi Cà Phê Order giúp cải tiến quá trình đặt món, và phục vụ tại nhà hàng, quán cà phê.
                                <br />
                                Sử dụng QR Code được gắn tại bàn để xem menu, gọi phục vụ và thanh toán.
                            </p>
                            <div className="clearfix" style={{ height: 20 }} />
                            <div className="input-trial">
                                <div className="input-field">
                                    {/* <form>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Số điện thoại của bạn"
                                            required
                                            defaultValue
                                        />
                                        <a className="linktrial" href data-toggle="modal" data-target="#fail">
                                            <button
                                                type="submit"
                                                className="ant-btn btn btn-submit  ant-btn-primary ant-btn-block"
                                            >
                                                <span>Dùng thử</span>
                                            </button>
                                        </a>
                                    </form> */}
                                    <div className="form-control">
                                        <Input
                                            required
                                            value={phone_number}
                                            onChange={onChangeInput}
                                            placeholder="Số điện thoại của bạn"
                                            size="large"
                                            style={{ width: '60%', borderTopLeftRadius: 7, borderBottomLeftRadius: 7 }}
                                        />
                                        <Button
                                            loading={loading}
                                            onClick={submitForm}
                                            size="large"
                                            type="primary"
                                            style={{ width: '40%' }}
                                        >
                                            Dùng thử
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="clearfix" style={{ height: 35 }} />
                        </div>
                    </div>
                </div>
                {/* <div className="section">
                    <div className="container">
                        <div className="contentBlock">
                            <div className="subtitle mb-2">Đối tác của chúng tôi</div>
                            <div className="owl-carousel-2 owl-theme">
                                <div className="item">
                                    <img src="asset/images/partner1.jpg" alt />
                                </div>
                                <div className="item">
                                    <img src="asset/images/partner2.jpg" alt />
                                </div>
                                <div className="item">
                                    <img src="asset/images/partner3.jpg" alt />
                                </div>
                                <div className="item">
                                    <img src="asset/images/partner4.jpg" alt />
                                </div>
                                <div className="item">
                                    <img src="asset/images/partner5.jpg" alt />
                                </div>
                                <div className="item">
                                    <img src="asset/images/partner6.jpg" alt />
                                </div>
                                <div className="item">
                                    <img src="asset/images/partner1.jpg" alt />
                                </div>
                                <div className="item">
                                    <img src="asset/images/partner2.jpg" alt />
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}
                <div className="section TabsFeature">
                    <div className="container">
                        <div className="inner">
                            <div className="subtitle">Tính năng nổi bật</div>
                            <div className="titleBlock">Sản phẩm</div>
                            <div className="clearfix" style={{ height: 35 }} />
                            <div className="innerSection">
                                <article className="home-left-right-feature clearfix media-aligned-right">
                                    <div className="home-left-right-media">
                                        <img
                                            className="feature-image"
                                            src="https://s3.kstorage.vn/qrpayment/common/mockup-laptop.png"
                                        />
                                    </div>
                                    <div className="home-left-right-text padding-left-80 text-left">
                                        <h1 className="feature-title">Menu linh hoạt</h1>
                                        <div className="rte">
                                            <p>Dễ dàng thay đổi menu, thay đổi giá và cách hiển thị.</p>
                                        </div>
                                    </div>
                                </article>
                                <article className="home-left-right-feature clearfix media-aligned-right  row-reverse">
                                    <div className="home-left-right-media">
                                        <img
                                            className="feature-image"
                                            src="https://s3.kstorage.vn/qrpayment/common/screen-4-crop.png"
                                        />
                                    </div>
                                    <div className="home-left-right-text padding-right-80 text-left">
                                        <h1 className="feature-title">Gọi phục vụ dễ dàng</h1>
                                        <div className="rte">
                                            <p>
                                                Chỉ cần quét mã QR Code để gọi nhân viên phục vụ. Giúp tăng mức độ hài
                                                lòng của khách hàng.
                                            </p>
                                        </div>
                                    </div>
                                </article>
                                <article className="home-left-right-feature clearfix media-aligned-right">
                                    <div className="home-left-right-media">
                                        <img
                                            className="feature-image"
                                            src="https://s3.kstorage.vn/qrpayment/common/screen-2-crop.png"
                                        />
                                    </div>
                                    <div className="home-left-right-text padding-left-80 text-left">
                                        <h1 className="feature-title">Đặt hàng nhanh chóng</h1>
                                        <div className="rte">
                                            <p>
                                                Không cần phải đến quầy hoặc gọi phục vụ, khách hàng có thể thực hiện
                                                gọi món trực tiếp trên điện thoại, hoặc máy tính bảng. Tăng trải nghiệm
                                                khách hàng với hình thức đặt món độc và lạ.
                                            </p>
                                        </div>
                                    </div>
                                </article>
                                <article className="home-left-right-feature clearfix media-aligned-right  row-reverse">
                                    <div className="home-left-right-media">
                                        <img
                                            className="feature-image"
                                            src="https://s3.kstorage.vn/qrpayment/common/screen-1-crop.png"
                                        />
                                    </div>
                                    <div className="home-left-right-text padding-right-80 text-left">
                                        <h1 className="feature-title">Không còn hàng đợi</h1>
                                        <div className="rte">
                                            <p>
                                                Các đơn hàng được khách hàng thực hiện trực tiếp trên điện thoại, hệ
                                                thống sẽ ghi nhận các đơn hàng và chuyển đến bộ phận tiếp nhận.
                                            </p>
                                        </div>
                                    </div>
                                </article>
                                <article className="home-left-right-feature clearfix media-aligned-right">
                                    <div className="home-left-right-media">
                                        <img
                                            className="feature-image"
                                            src="https://s3.kstorage.vn/qrpayment/common/screen-3-crop.png"
                                        />
                                    </div>
                                    <div className="home-left-right-text padding-left-80 text-left">
                                        <h1 className="feature-title">Thống kê chi tiết báo cáo</h1>
                                        <div className="rte">
                                            <p>
                                                Có đầy đủ thống kê về số lượt xem menu, số lượng đơn hàng, số lần gọi
                                                nhân viên. Ngoài ra còn có các thống kê, báo cáo tương tự như một hệ
                                                thống POS truyền thống.
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className="clearfix" style={{ height: 60 }} /> */}
                {/* <div className="section">
                    <div className="container">
                        <div className="inner">
                            <div className="titleBlock">Wifi Marketing</div>
                            <p>
                                Tích hợp hệ thống Wifi Marketing cho Doanh nghiệp và Cửa hàng giúp truyền đạt thông tin
                                quảng cáo &amp; tăng cường nhận diện thương diện với khách hàng của bạn.
                            </p>
                            <div className="clearfix" style={{ height: 35 }} />
                        </div>
                    </div>
                    <div className="contentBlock">
                        <div className="owl-carousel owl-theme">
                            <div className="item">
                                <img src="asset/images/imgdemo1.jpg" alt />
                            </div>
                            <div className="item">
                                <img src="asset/images/imgdemo2.jpg" alt />
                            </div>
                            <div className="item">
                                <img src="asset/images/imgdemo3.jpg" alt />
                            </div>
                            <div className="item">
                                <img src="asset/images/imgdemo1.jpg" alt />
                            </div>
                            <div className="item">
                                <img src="asset/images/imgdemo2.jpg" alt />
                            </div>
                        </div>
                    </div>
                </div> */}
                <div className="noti-trial">
                    <div className="container">
                        <div className="inner">
                            <div className="innertxt">
                                <h5>Sẵn sàng để bắt đầu?</h5>
                                <p>Hãy dùng thử để trải nghiệm các tính năng của Wifi Cà Phê.</p>
                            </div>
                            <a className="linktrial" href="#formResiter">
                                TRẢI NGHIỆM NGAY
                            </a>
                        </div>
                    </div>
                </div>
                <div id="contact" className="infomation-contact">
                    <div className="container">
                        <div className="title-block text-center">
                            <span className="label cl1">Hỗ trợ</span>
                            <span className="title">Liên hệ với chúng tôi</span>
                            <span className="line" />
                        </div>
                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={8}>
                                <div className="box d-flex">
                                    <div className="icon">
                                        <img src="/download.png" height={48} />
                                    </div>
                                    <div className="content">
                                        <h6>Đường dây nóng</h6>
                                        <p className="cl1">
                                            <a href="tel:0983723021" rel="nofollow">
                                                0983 723 021
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div className="box d-flex">
                                    <div className="icon">
                                        <img src="/download1.png" height={48} />
                                    </div>
                                    <div className="content">
                                        <h6>Góp ý &amp; hỗ trợ</h6>
                                        <p className="cl1">
                                            <a href="mailto:sale@wificaphe.com" rel="nofollow">
                                                sale@wificaphe.com
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div className="box d-flex">
                                    <div className="icon">
                                        <img src="/download2.png" height={48} />
                                    </div>
                                    <div className="content">
                                        <h6>Fanpage</h6>
                                        <p className="cl1">
                                            <a href="https://fb.com/wifibiz.vn" target="_blank" rel="nofollow">
                                                https://fb.com/wifibiz.vn
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className="location-contact">
                    <div className="container">
                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={12}>
                                <div className="location-info location-info-left">
                                    <h6 style={{ fontWeight: 600 }}>Hà Nội</h6>
                                    <p>
                                        Tòa nhà LE, số 11, ngõ 71 Láng Hạ, <br /> Ba Đình, Hà Nội, Việt Nam
                                    </p>
                                    <a
                                        className="cl1"
                                        rel="nofollow"
                                        href="https://goo.gl/maps/AmeoFicPGF72"
                                        target="_blank"
                                    >
                                        Xem bản đồ
                                    </a>
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div className="location-info">
                                    <h6 style={{ fontWeight: 600 }}>Hồ Chí Minh</h6>
                                    <p>
                                        Tầng 10, 198 Đường 3/2 P12 <br /> Q10, TP Hồ Chí Minh, VN
                                    </p>
                                    <a
                                        className="cl1"
                                        rel="nofollow"
                                        href="https://goo.gl/maps/wUXQZwveg9Cp47KH9"
                                        target="_blank"
                                    >
                                        Xem bản đồ
                                    </a>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
                <footer id="contact">
                    <div className="container">
                        <div className="innerfooter">
                            <div className="copyright ">
                                <p>Copyright {new Date().getFullYear()} by Wifi Cà Phê. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
    try {
        const { phone_number } = parseCookies(context);
        if (phone_number) {
            await axios.post(`${process.env.API_URL}/api/client/customer/register`, {
                phone_number,
            });
            destroyCookie(context, 'phone_number');
        }
        return {
            props: {},
        };
    } catch {
        return {
            props: {},
        };
    }
});

export default Index;
