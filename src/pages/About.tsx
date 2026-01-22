import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../components/Icons/Icon';
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
          <h1 className={styles.title}>
            <Icon name="info" size={40} color="rgba(96, 165, 250, 0.9)" />
            <span>Giới thiệu về ShowBill</span>
          </h1>
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
            ShowBill là nền tảng công nghệ hiện đại được thiết kế để giúp các doanh nghiệp và cá nhân khẳng định uy tín thương hiệu 
            thông qua việc trưng bày minh bạch các bill giao dịch thực tế. Nền tảng cho phép khách hàng dễ dàng tìm kiếm, xem và đối chiếu 
            thông tin bill một cách chi tiết, tạo niềm tin tuyệt đối trước khi quyết định sử dụng dịch vụ.
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
                <Icon name="star" size={32} color="rgba(96, 165, 250, 0.9)" />
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
                <Icon name="package" size={32} color="rgba(34, 197, 94, 0.9)" />
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
                <Icon name="users" size={32} color="rgba(168, 85, 247, 0.9)" />
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
              <strong>Hồ sơ Admin chuyên nghiệp:</strong> Mỗi admin có trang profile riêng với thông tin chi tiết, mô tả, avatar và banner tùy chỉnh
            </li>
            <li className={styles.listItem}>
              <strong>Bộ sưu tập Bill đa dạng:</strong> Trưng bày tất cả các bill giao dịch được phân loại theo OB version và Category một cách có tổ chức
            </li>
            <li className={styles.listItem}>
              <strong>Xem chi tiết nâng cao:</strong> Phóng to, zoom và pan hình ảnh để xem rõ từng chi tiết của bill với công nghệ bảo vệ chống screenshot
            </li>
            <li className={styles.listItem}>
              <strong>Tìm kiếm và lọc thông minh:</strong> Dễ dàng tìm kiếm admin theo tên, mô tả hoặc lọc theo OB version và Category
            </li>
            <li className={styles.listItem}>
              <strong>Thống kê chi tiết:</strong> Theo dõi số lượt xem profile và bill theo tuần, tháng, năm với biểu đồ trực quan
            </li>
            <li className={styles.listItem}>
              <strong>Bảo mật cao cấp:</strong> Hệ thống tự động bảo vệ hình ảnh khỏi screenshot, download và copy
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
            Tham gia ShowBill để xây dựng thương hiệu uy tín và tạo niềm tin tuyệt đối với khách hàng. Đăng ký tài khoản admin ngay để bắt đầu 
            trưng bày các bill giao dịch của bạn một cách chuyên nghiệp. Với các gói dịch vụ linh hoạt từ Basic đến VIP, bạn có thể chọn gói phù hợp 
            với nhu cầu của mình.
          </p>
        </motion.div>
      </div>
    </ClientLayout>
  );
};

export default About;

