import React from 'react';
import { motion } from 'framer-motion';
import ClientLayout from '../components/ClientLayout/ClientLayout';
import styles from './About.module.css';

const About: React.FC = () => {
  return (
    <ClientLayout>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.hero}
        >
          <h1 className={styles.title}>Giới thiệu về ShowBill</h1>
          <p className={styles.subtitle}>
            Nền tảng công nghệ hiện đại giúp khẳng định thương hiệu và tạo niềm tin cho khách hàng
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>ShowBill là gì?</h2>
          <p className={styles.text}>
            ShowBill là nền tảng tổng hợp và trưng bày tất cả các bill uy tín, giúp khách hàng dễ dàng kiểm chứng độ tin cậy của bạn. 
            Tại đây, người dùng có thể chọn admin để xem hồ sơ, bộ sưu tập bill giao dịch, đối chiếu thông tin và phóng to hình ảnh để xem chi tiết.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>Mục tiêu của chúng tôi</h2>
          <div className={styles.features}>
            <motion.div
              className={styles.feature}
              onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty('--mouse-x', '50%');
                e.currentTarget.style.setProperty('--mouse-y', '50%');
              }}
            >
              <div className={styles.featureIconWrapper}>
                <div className={styles.featureIcon}>🎯</div>
              </div>
              <h3 className={styles.featureTitle}>Khẳng định thương hiệu</h3>
              <p className={styles.featureText}>
                Giúp bạn thể hiện tính chuyên nghiệp và uy tín thông qua việc trưng bày các bill giao dịch thực tế.
              </p>
            </motion.div>
            <motion.div
              className={styles.feature}
              onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty('--mouse-x', '50%');
                e.currentTarget.style.setProperty('--mouse-y', '50%');
              }}
            >
              <div className={styles.featureIconWrapper}>
                <div className={styles.featureIcon}>💼</div>
              </div>
              <h3 className={styles.featureTitle}>Tăng sự chuyên nghiệp</h3>
              <p className={styles.featureText}>
                Tạo ấn tượng tốt với khách hàng bằng cách trình bày minh bạch và có tổ chức các giao dịch đã thực hiện.
              </p>
            </motion.div>
            <motion.div
              className={styles.feature}
              onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty('--mouse-x', '50%');
                e.currentTarget.style.setProperty('--mouse-y', '50%');
              }}
            >
              <div className={styles.featureIconWrapper}>
                <div className={styles.featureIcon}>🤝</div>
              </div>
              <h3 className={styles.featureTitle}>Tạo niềm tin tuyệt đối</h3>
              <p className={styles.featureText}>
                Khách hàng có thể xem chi tiết, đối chiếu thông tin và tự đánh giá độ tin cậy trước khi quyết định sử dụng dịch vụ.
              </p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>Tính năng nổi bật</h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <strong>Hồ sơ Admin chi tiết:</strong> Mỗi admin có trang profile riêng với thông tin, mô tả và avatar
            </li>
            <li className={styles.listItem}>
              <strong>Bộ sưu tập Bill:</strong> Trưng bày tất cả các bill giao dịch một cách có tổ chức và dễ xem
            </li>
            <li className={styles.listItem}>
              <strong>Xem chi tiết:</strong> Phóng to hình ảnh để xem rõ từng chi tiết của bill
            </li>
            <li className={styles.listItem}>
              <strong>Tìm kiếm thông minh:</strong> Dễ dàng tìm kiếm admin theo tên hoặc mô tả
            </li>
            <li className={styles.listItem}>
              <strong>Thống kê lượt xem:</strong> Theo dõi số lượt xem profile và bill của bạn
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={styles.section}
        >
          <h2 className={styles.sectionTitle}>Bắt đầu ngay hôm nay</h2>
          <p className={styles.text}>
            Tham gia ShowBill để xây dựng thương hiệu và tạo niềm tin với khách hàng. Đăng ký tài khoản admin ngay để bắt đầu trưng bày các bill giao dịch của bạn.
          </p>
        </motion.div>
      </div>
    </ClientLayout>
  );
};

export default About;

