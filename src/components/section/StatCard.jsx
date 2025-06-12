import { motion } from "framer-motion";
import { memo } from "react";
import PropTypes from "prop-types";

const StatCard = memo(({ title, value, icon, loading = false }) => (
  <motion.div
    whileHover={{
      scale: 1.02,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className="bg-white rounded-lg shadow p-4 sm:p-6 cursor-pointer"
  >
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
        {loading ? (
          <div className="flex items-center mt-1">
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {value || "0"}
          </p>
        )}
      </div>
      <div className="p-1 rounded-full flex-shrink-0">{icon}</div>
    </div>
  </motion.div>
));

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  loading: PropTypes.bool,
};

StatCard.displayName = "StatCard";

export default StatCard;
