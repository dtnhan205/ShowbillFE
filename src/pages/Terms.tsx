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
            Quy định và điều khoản khi sử dụng dịch vụ ShowBill
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
            Bằng việc truy cập và sử dụng dịch vụ ShowBill, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện này. 
            Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>2. Định nghĩa dịch vụ</h2>
          <p className={styles.text}>
            ShowBill là nền tảng cho phép các Admin đăng ký tài khoản, tải lên và trưng bày các bill giao dịch để khách hàng 
            có thể xem và đối chiếu. Dịch vụ bao gồm:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <strong>Tài khoản Admin:</strong> Cho phép đăng ký và quản lý hồ sơ cá nhân, thông tin và avatar
            </li>
            <li className={styles.listItem}>
              <strong>Quản lý Bill:</strong> Tải lên, chỉnh sửa và quản lý các bill giao dịch
            </li>
            <li className={styles.listItem}>
              <strong>Trưng bày công khai:</strong> Hiển thị hồ sơ và bill cho người dùng xem công khai
            </li>
            <li className={styles.listItem}>
              <strong>Thống kê:</strong> Theo dõi lượt xem profile và bill
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>2.1. Tuyên bố về “bill”</h2>
          <p className={styles.text}>
            Bill hiển thị trên ShowBill chỉ mang tính tham khảo uy tín, không phải chứng từ tài chính hợp pháp và không được xem là
            bằng chứng giao dịch được xác thực. Người đăng chịu trách nhiệm về nội dung bill và phải che thông tin nhạy cảm trước khi
            công khai.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>3. Đăng ký tài khoản</h2>
          <p className={styles.text}>Khi đăng ký tài khoản Admin, bạn cam kết:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              Cung cấp thông tin chính xác, đầy đủ và cập nhật
            </li>
            <li className={styles.listItem}>
              Duy trì và cập nhật thông tin tài khoản khi có thay đổi
            </li>
            <li className={styles.listItem}>
              Bảo mật thông tin đăng nhập và chịu trách nhiệm về mọi hoạt động diễn ra dưới tài khoản của bạn
            </li>
            <li className={styles.listItem}>
              Thông báo ngay cho chúng tôi nếu phát hiện vi phạm bảo mật hoặc sử dụng trái phép tài khoản
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>4. Nội dung và quyền sở hữu</h2>
          <p className={styles.text}>
            Bạn giữ quyền sở hữu đối với tất cả nội dung bạn tải lên ShowBill, bao gồm hình ảnh bill và thông tin hồ sơ. 
            Tuy nhiên, bằng việc tải lên nội dung, bạn cấp cho ShowBill quyền:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              Hiển thị, phân phối và truyền tải nội dung của bạn trên nền tảng
            </li>
            <li className={styles.listItem}>
              Sử dụng nội dung để vận hành và cải thiện dịch vụ
            </li>
            <li className={styles.listItem}>
              Áp dụng các biện pháp bảo vệ như chống screenshot và download để bảo vệ nội dung của bạn
            </li>
          </ul>
          <p className={styles.text}>
            Bạn cam kết chỉ tải lên nội dung mà bạn có quyền sử dụng và không vi phạm quyền của bên thứ ba.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>5. Hành vi bị cấm</h2>
          <p className={styles.text}>Bạn không được phép:</p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              Tải lên nội dung giả mạo, lừa đảo hoặc vi phạm pháp luật
            </li>
            <li className={styles.listItem}>
              Sử dụng dịch vụ cho mục đích bất hợp pháp hoặc gian lận
            </li>
            <li className={styles.listItem}>
              Cố gắng vượt qua các biện pháp bảo mật của nền tảng (screenshot, download trái phép)
            </li>
            <li className={styles.listItem}>
              Tấn công, phá hoại hoặc làm gián đoạn hoạt động của dịch vụ
            </li>
            <li className={styles.listItem}>
              Sử dụng bot, script hoặc công cụ tự động để truy cập dịch vụ không được phép
            </li>
            <li className={styles.listItem}>
              Giả mạo danh tính hoặc cung cấp thông tin sai lệch
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>6. Bảo mật và bảo vệ nội dung</h2>
          <p className={styles.text}>
            ShowBill áp dụng các biện pháp bảo mật để bảo vệ nội dung của bạn, bao gồm:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              Chống screenshot và chụp màn hình
            </li>
            <li className={styles.listItem}>
              Chống download và sao chép hình ảnh
            </li>
            <li className={styles.listItem}>
              Bảo vệ quyền click chuột phải và kéo thả
            </li>
            <li className={styles.listItem}>
              Mã hóa dữ liệu và kiểm soát truy cập
            </li>
          </ul>
          <p className={styles.text}>
            Tuy nhiên, không có hệ thống nào hoàn toàn an toàn. Bạn sử dụng dịch vụ với rủi ro của chính mình.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>7. Chấm dứt tài khoản</h2>
          <p className={styles.text}>
            Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản của bạn nếu bạn vi phạm các điều khoản này hoặc có hành vi 
            không phù hợp. Bạn cũng có thể yêu cầu xóa tài khoản bất cứ lúc nào thông qua trang quản trị.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>8. Miễn trừ trách nhiệm</h2>
          <p className={styles.text}>
            ShowBill cung cấp dịch vụ "như hiện tại" và không đảm bảo rằng dịch vụ sẽ không bị gián đoạn, an toàn hoặc không có lỗi. 
            Chúng tôi không chịu trách nhiệm về:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              Bất kỳ thiệt hại nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ
            </li>
            <li className={styles.listItem}>
              Mất mát dữ liệu hoặc nội dung do lỗi kỹ thuật hoặc hành động của bên thứ ba
            </li>
            <li className={styles.listItem}>
              Tính chính xác hoặc độ tin cậy của nội dung do người dùng tải lên
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>9. Thay đổi điều khoản</h2>
          <p className={styles.text}>
            Chúng tôi có quyền cập nhật các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay sau khi được đăng tải. 
            Việc bạn tiếp tục sử dụng dịch vụ sau khi thay đổi có hiệu lực được coi là bạn đã chấp nhận các điều khoản mới.
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
            Nếu bạn có câu hỏi về các điều khoản sử dụng này, vui lòng liên hệ với chúng tôi qua trang 
            <a href="/contact" className={styles.link}> Liên hệ</a>.
          </p>
        </motion.div>
      </div>
    </ClientLayout>
  );
};

export default Terms;

