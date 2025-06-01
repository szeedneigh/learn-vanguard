import { motion } from "framer-motion";
import PropTypes from 'prop-types';

const StatCard = ({ title, value, icon }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-lg shadow p-4"
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className="p-1 rounded-full">{icon}</div>
    </div>
  </motion.div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired
};

export default StatCard; 