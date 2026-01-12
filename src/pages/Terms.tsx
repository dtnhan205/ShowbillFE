import React from 'react';
import { motion } from 'framer-motion';
import ClientLayout from '../components/ClientLayout/ClientLayout';
import styles from './Terms.module.css';

const Terms: React.FC = () => {
  return (
    <ClientLayout>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.hero}
        >
          <h1 className={styles.title}>Điều Khoản Sử Dụng</h1>
          <p className={styles.subtitle}>
            Vui lòng đọc kỹ các điều khoản và điều kiện sử dụng dịch vụ ShowBill
          </p>
          <p className={styles.lastUpdated}>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>1. Chấp nhận điều khoản</h2>
          <p className={styles.text}>
            Bằng việc truy cập và sử dụng nền tảng ShowBill, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện này. 
            Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>2. Định nghĩa</h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <strong>"ShowBill"</strong> là nền tảng trực tuyến cho phép người dùng quản lý và chia sẻ các bill giao dịch.
            </li>
            <li className={styles.listItem}>
              <strong>"Người dùng"</strong> hoặc <strong>"Bạn"</strong> là bất kỳ cá nhân hoặc tổ chức nào truy cập hoặc sử dụng dịch vụ.
            </li>
            <li className={styles.listItem}>
              <strong>"Admin"</strong> là người dùng đã đăng ký và được cấp quyền quản lý bill trên nền tảng.
            </li>
            <li className={styles.listItem}>
              <strong>"Bill"</strong> là các hóa đơn, chứng từ giao dịch được người dùng tải lên và quản lý trên nền tảng.
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>3. Đăng ký tài khoản</h2>
          <p className={styles.text}>
            Để sử dụng các tính năng quản lý bill, bạn cần đăng ký tài khoản Admin. Khi đăng ký, bạn cam kết:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Cung cấp thông tin chính xác, đầy đủ và cập nhật.</li>
            <li className={styles.listItem}>Bảo mật thông tin đăng nhập của bạn.</li>
            <li className={styles.listItem}>Chịu trách nhiệm cho mọi hoạt động diễn ra dưới tài khoản của bạn.</li>
            <li className={styles.listItem}>Thông báo ngay cho chúng tôi nếu phát hiện vi phạm bảo mật.</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>4. Sử dụng dịch vụ</h2>
          <p className={styles.text}>
            Bạn đồng ý sử dụng dịch vụ ShowBill một cách hợp pháp và phù hợp với các mục đích được phép. Bạn không được:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Tải lên hoặc chia sẻ nội dung vi phạm pháp luật, bất hợp pháp hoặc có hại.</li>
            <li className={styles.listItem}>Sử dụng dịch vụ để lừa đảo, gian lận hoặc gây hại cho người khác.</li>
            <li className={styles.listItem}>Xâm phạm quyền sở hữu trí tuệ của người khác.</li>
            <li className={styles.listItem}>Cố gắng truy cập trái phép vào hệ thống hoặc dữ liệu của người khác.</li>
            <li className={styles.listItem}>Sử dụng bot, script hoặc công cụ tự động để can thiệp vào hoạt động của nền tảng.</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>5. Quyền sở hữu và nội dung</h2>
          <p className={styles.text}>
            Bạn giữ quyền sở hữu đối với tất cả nội dung mà bạn tải lên nền tảng ShowBill. Tuy nhiên, bằng việc tải lên nội dung, 
            bạn cấp cho ShowBill quyền sử dụng, hiển thị và phân phối nội dung đó trên nền tảng.
          </p>
          <p className={styles.text}>
            ShowBill tôn trọng quyền sở hữu trí tuệ của người khác và yêu cầu người dùng làm tương tự. 
            Nếu bạn tin rằng nội dung của bạn đã bị sao chép vi phạm, vui lòng liên hệ với chúng tôi.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>6. Bảo mật và quyền riêng tư</h2>
          <p className={styles.text}>
            Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Việc thu thập, sử dụng và bảo vệ thông tin của bạn được quy định 
            trong Chính sách Bảo mật của chúng tôi. Bằng việc sử dụng dịch vụ, bạn đồng ý với việc thu thập và sử dụng thông tin 
            theo Chính sách Bảo mật.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>7. Từ chối trách nhiệm</h2>
          <p className={styles.text}>
            ShowBill được cung cấp "như hiện tại" và "như có sẵn". Chúng tôi không đảm bảo rằng dịch vụ sẽ không bị gián đoạn, 
            không có lỗi hoặc hoàn toàn an toàn. Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng 
            hoặc không thể sử dụng dịch vụ.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>8. Chấm dứt dịch vụ</h2>
          <p className={styles.text}>
            Chúng tôi có quyền chấm dứt hoặc tạm ngưng quyền truy cập của bạn vào dịch vụ bất cứ lúc nào, với hoặc không có thông báo, 
            vì bất kỳ lý do nào, bao gồm nhưng không giới hạn vi phạm các điều khoản này.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>9. Thay đổi điều khoản</h2>
          <p className={styles.text}>
            Chúng tôi có quyền sửa đổi các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay sau khi được đăng tải trên trang web. 
            Việc bạn tiếp tục sử dụng dịch vụ sau khi các thay đổi có hiệu lực được coi là bạn đã chấp nhận các điều khoản mới.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>10. Liên hệ</h2>
          <p className={styles.text}>
            Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi qua trang 
            <a href="/contact" className={styles.link}> Liên hệ</a>.
          </p>
        </motion.div>
      </div>
    </ClientLayout>
  );
};

export default Terms;

