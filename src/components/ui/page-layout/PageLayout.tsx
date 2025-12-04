import { type HTMLAttributes } from "react";
import styles from "./PageLayout.module.css";

const PageLayout = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) => {
  return (
    <div className={`${styles.container} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default PageLayout;
