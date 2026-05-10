"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import React from "react";

interface PageWrapperProps {
  children: React.ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
