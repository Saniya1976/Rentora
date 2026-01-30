const BlobBackground = ({ position = "top", color = "#04aaac", opacity = 0.15 }) => {
  return (
    <svg
      viewBox="0 0 1440 320"
      className={`absolute ${position === "top" ? "top-0" : "bottom-0"} left-0 w-full`}
      preserveAspectRatio="none"
      style={{ zIndex: 0 }}
    >
      <path
        fill={color}
        fillOpacity={opacity}
        d="M0,192L60,170.7C120,149,240,107,360,112C480,117,600,171,720,176C840,181,960,139,1080,128C1200,117,1320,139,1380,149.3L1440,160L1440,0L0,0Z"
      />
    </svg>
  );
};
export default BlobBackground;