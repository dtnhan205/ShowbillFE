import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../components/Icons/Icon';
import ClientLayout from '../components/ClientLayout/ClientLayout';
import styles from './Privacy.module.css';

const Privacy: React.FC = () => {
  return (
    <ClientLayout>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.hero}
        >
          <h1 className={styles.title}>
            <Icon name="shield" size={40} color="rgba(34, 197, 94, 0.9)" />
            <span>Chính Sách Bảo Mật</span>
          </h1>
          <p className={styles.subtitle}>
            Cam kết bảo vệ thông tin cá nhân và quyền riêng tư của người dùng
          </p>
          <p className={styles.lastUpdated}>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>1. Giới thiệu</h2>
          <p className={styles.text}>
            ShowBill cam kết bảo vệ quyền riêng tư và thông tin cá nhân của người dùng. Chính sách bảo mật này mô tả 
            cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin của bạn khi sử dụng dịch vụ ShowBill.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>2. Thông tin chúng tôi thu thập</h2>
          <p className={styles.text}>Chúng tôi có thể thu thập các loại thông tin sau:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <strong>Thông tin đăng ký:</strong> Tên hiển thị, email, mật khẩu (được mã hóa), và các thông tin khác 
              bạn cung cấp khi đăng ký tài khoản Admin.
            </li>
            <li className={styles.listItem}>
              <strong>Thông tin sử dụng:</strong> Dữ liệu về cách bạn sử dụng dịch vụ, bao gồm các bill bạn tải lên, 
              lượt xem, và các tương tác khác.
            </li>
            <li className={styles.listItem}>
              <strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, hệ điều hành, và thông tin thiết bị 
              để cải thiện dịch vụ và bảo mật.
            </li>
            <li className={styles.listItem}>
              <strong>Cookies và công nghệ theo dõi:</strong> Chúng tôi sử dụng cookies để lưu trữ thông tin đăng nhập 
              và cải thiện trải nghiệm người dùng.
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>3. Cách chúng tôi sử dụng thông tin</h2>
          <p className={styles.text}>Thông tin thu thập được sử dụng để:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Cung cấp, duy trì và cải thiện dịch vụ ShowBill</li>
            <li className={styles.listItem}>Xử lý và quản lý các bill bạn tải lên</li>
            <li className={styles.listItem}>Xác thực danh tính và bảo mật tài khoản</li>
            <li className={styles.listItem}>Gửi thông báo về dịch vụ và cập nhật quan trọng</li>
            <li className={styles.listItem}>Phân tích và cải thiện hiệu suất dịch vụ</li>
            <li className={styles.listItem}>Tuân thủ các nghĩa vụ pháp lý</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>4. Bảo vệ thông tin</h2>
          <p className={styles.text}>
            Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ thông tin của bạn khỏi 
            truy cập trái phép, mất mát, sử dụng sai hoặc tiết lộ:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Mã hóa dữ liệu nhạy cảm trong quá trình truyền và lưu trữ</li>
            <li className={styles.listItem}>Bảo vệ hình ảnh bill bằng các biện pháp chống screenshot và download</li>
            <li className={styles.listItem}>Kiểm soát truy cập nghiêm ngặt và xác thực đa yếu tố</li>
            <li className={styles.listItem}>Giám sát và phát hiện các hoạt động bất thường</li>
            <li className={styles.listItem}>Cập nhật và vá lỗi bảo mật thường xuyên</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>5. Chia sẻ thông tin</h2>
          <p className={styles.text}>
            Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba, ngoại trừ:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Khi có yêu cầu của cơ quan pháp luật hoặc tòa án</li>
            <li className={styles.listItem}>Để bảo vệ quyền, tài sản hoặc an toàn của ShowBill và người dùng</li>
            <li className={styles.listItem}>Với các nhà cung cấp dịch vụ đáng tin cậy giúp vận hành nền tảng (với cam kết bảo mật)</li>
            <li className={styles.listItem}>Khi bạn đồng ý rõ ràng cho phép chia sẻ</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>6. Quyền của người dùng</h2>
          <p className={styles.text}>Bạn có quyền:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Truy cập và xem thông tin cá nhân của mình</li>
            <li className={styles.listItem}>Yêu cầu chỉnh sửa hoặc xóa thông tin không chính xác</li>
            <li className={styles.listItem}>Yêu cầu xóa tài khoản và dữ liệu liên quan</li>
            <li className={styles.listItem}>Từ chối nhận email marketing (nếu có)</li>
            <li className={styles.listItem}>Khiếu nại về việc xử lý dữ liệu cá nhân</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>7. Cookies</h2>
          <p className={styles.text}>
            Chúng tôi sử dụng cookies để lưu trữ thông tin đăng nhập và cải thiện trải nghiệm. Bạn có thể quản lý 
            cookies thông qua cài đặt trình duyệt, nhưng điều này có thể ảnh hưởng đến một số chức năng của dịch vụ.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>8. Thay đổi chính sách</h2>
          <p className={styles.text}>
            Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Các thay đổi sẽ được thông báo trên trang web 
            và có hiệu lực ngay sau khi được đăng tải. Việc bạn tiếp tục sử dụng dịch vụ sau khi thay đổi có hiệu lực 
            được coi là bạn đã chấp nhận chính sách mới.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>9. Liên hệ</h2>
          <p className={styles.text}>
            Nếu bạn có câu hỏi hoặc yêu cầu về chính sách bảo mật này, vui lòng liên hệ với chúng tôi qua trang 
            <a href="/contact" className={styles.link}> Liên hệ</a>.
          </p>
        </motion.div>
      </div>
    </ClientLayout>
  );
};

export default Privacy;

