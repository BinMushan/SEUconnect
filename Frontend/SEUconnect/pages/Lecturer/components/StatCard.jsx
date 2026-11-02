import React from 'react';

/**
 * StatCard component
 * Displays key quantitative academic metrics with visual accents and badges.
 */
export default function StatCard({
  title,
  value,
  subtext,
  badgeText,
  badgeType = 'default',
  colorScheme = 'blue',
  icon,
  onClick,
}) {
  return (
    <div
      className={`lec-stat-card color-${colorScheme} ${onClick ? 'interactive' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="lec-stat-card-inner">
        <div className="lec-stat-header">
          <div className="lec-stat-icon-wrap">{icon}</div>
          {badgeText && (
            <span className={`lec-stat-badge badge-${badgeType}`}>{badgeText}</span>
          )}
        </div>
        <div className="lec-stat-content">
          <h4 className="lec-stat-title">{title}</h4>
          <div className="lec-stat-value">{value}</div>
          {subtext && <p className="lec-stat-subtext">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

