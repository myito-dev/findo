"use client";

import { motion } from "motion/react";
import Link from "next/link";

/** `next/link` wrapped so it accepts Motion props (whileTap, layoutId, etc.) —
 * shared across nav and inline arrow/text links. */
export const MotionLink = motion.create(Link);
