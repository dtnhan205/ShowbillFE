import React from 'react';
import { motion } from 'framer-motion';
import ClientLayout from '../components/ClientLayout/ClientLayout';
import styles from './Guide.module.css';

const Guide: React.FC = () => {
  return (
    <ClientLayout>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.hero}
        >
          <h1 className={styles.title}>Hướng Dẫn Sử Dụng</h1>
          <p className={styles.subtitle}>
            Hướng dẫn chi tiết cách sử dụng nền tảng ShowBill để quản lý và chia sẻ bill của bạn
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>1. Đăng ký tài khoản Admin</h2>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Truy cập trang đăng ký</h3>
              <p className={styles.stepText}>
                Nhấp vào nút "Đăng ký" ở góc trên bên phải của trang web hoặc truy cập trực tiếp trang đăng ký.
              </p>
            </div>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Điền thông tin</h3>
              <p className={styles.stepText}>
                Điền đầy đủ thông tin bao gồm: tên hiển thị, email, mật khẩu và các thông tin khác được yêu cầu.
              </p>
            </div>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Xác nhận tài khoản</h3>
              <p className={styles.stepText}>
                Sau khi đăng ký thành công, bạn sẽ nhận được email xác nhận. Làm theo hướng dẫn để kích hoạt tài khoản.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>2. Đăng nhập và quản lý hồ sơ</h2>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Đăng nhập</h3>
              <p className={styles.stepText}>
                Sử dụng email và mật khẩu đã đăng ký để đăng nhập vào hệ thống Admin.
              </p>
            </div>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Cập nhật hồ sơ</h3>
              <p className={styles.stepText}>
                Vào mục "Hồ sơ" để cập nhật thông tin cá nhân, avatar, và mô tả về bản thân.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>3. Tải lên và quản lý Bill</h2>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Tạo bill mới</h3>
              <p className={styles.stepText}>
                Vào mục "Sản phẩm" → "Thêm sản phẩm" để tạo bill mới. Điền thông tin: tên bill, chọn OB version, 
                chọn Category, và tải lên hình ảnh bill.
              </p>
            </div>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Chờ duyệt</h3>
              <p className={styles.stepText}>
                Sau khi tải lên, bill của bạn sẽ ở trạng thái "Chờ duyệt". Hệ thống sẽ xem xét và duyệt bill trong thời gian ngắn.
              </p>
            </div>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Quản lý bill</h3>
              <p className={styles.stepText}>
                Bạn có thể xem, chỉnh sửa hoặc xóa các bill đã tải lên trong danh sách "Sản phẩm" của mình.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>4. Xem và chia sẻ Profile</h2>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Truy cập profile công khai</h3>
              <p className={styles.stepText}>
                Mỗi Admin có một profile công khai hiển thị tất cả các bill đã được duyệt. Bạn có thể chia sẻ link profile 
                của mình cho khách hàng.
              </p>
            </div>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Lọc và tìm kiếm</h3>
              <p className={styles.stepText}>
                Trên profile, khách hàng có thể lọc bill theo OB version hoặc Category để tìm kiếm dễ dàng hơn.
              </p>
            </div>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Xem chi tiết bill</h3>
              <p className={styles.stepText}>
                Khách hàng có thể nhấp vào bill để xem chi tiết với chức năng zoom và pan để xem rõ hơn.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>5. Tính năng bảo mật</h2>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Bảo vệ hình ảnh</h3>
              <p className={styles.featureText}>
                Hệ thống tự động bảo vệ hình ảnh bill khỏi việc screenshot, download, và copy. Khách hàng chỉ có thể xem 
                trực tiếp trên trang web.
              </p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Kiểm soát truy cập</h3>
              <p className={styles.featureText}>
                Chỉ Admin đã đăng ký mới có thể tải lên và quản lý bill. Khách hàng chỉ có thể xem các bill đã được duyệt.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>6. Quản lý OB và Category</h2>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Quản lý OB</h3>
              <p className={styles.stepText}>
                Vào mục "Quản lý OB" để thêm, chỉnh sửa hoặc xóa các OB version. OB version giúp phân loại bill theo 
                phiên bản sản phẩm.
              </p>
            </div>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Quản lý Category</h3>
              <p className={styles.stepText}>
                Vào mục "Quản lý Category" để quản lý các danh mục sản phẩm. Category giúp phân loại bill theo loại sản phẩm.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>7. Thống kê và báo cáo</h2>
          <p className={styles.text}>
            Trên Dashboard, bạn có thể xem các thống kê về:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Tổng số bill đã tải lên</li>
            <li className={styles.listItem}>Tổng lượt xem của tất cả bill</li>
            <li className={styles.listItem}>Bill được xem nhiều nhất</li>
            <li className={styles.listItem}>Thống kê theo OB và Category</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>8. Hỗ trợ và liên hệ</h2>
          <p className={styles.text}>
            Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Xem phần "Câu hỏi thường gặp" (FAQ)</li>
            <li className={styles.listItem}>Liên hệ qua trang <a href="/contact" className={styles.link}>Liên hệ</a></li>
            <li className={styles.listItem}>Gửi email đến bộ phận hỗ trợ</li>
          </ul>
        </motion.div>
      </div>
    </ClientLayout>
  );
};

export default Guide;

