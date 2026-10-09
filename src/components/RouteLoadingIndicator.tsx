import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Package, ShoppingCart, Store, Truck } from 'lucide-react';

const LOADING_DURATION = 720;

export default function RouteLoadingIndicator() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsLoading(true);
    const timeoutId = window.setTimeout(() => setIsLoading(false), LOADING_DURATION);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, location.search]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          className="pointer-events-none fixed inset-x-0 top-0 z-[60]"
        >
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 0.68, 1], opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.68, times: [0, 0.7, 1], ease: [0.22, 1, 0.36, 1] }}
            className="h-0.5 w-full origin-left bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 shadow-[0_0_18px_rgba(99,102,241,0.45)]"
          />

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="mx-auto mt-3 w-[min(28rem,calc(100vw-2rem))]"
          >
            <div className="relative h-16 rounded-2xl border border-white/70 bg-white/80 px-4 shadow-[0_16px_42px_rgba(15,23,42,0.10)] backdrop-blur-xl">
              <div className="absolute left-8 right-8 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-100">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.66, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full origin-left rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400"
                />
              </div>

              <div className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm">
                <Store className="h-4.5 w-4.5" />
              </div>
              <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600 shadow-sm">
                <ShoppingCart className="h-4.5 w-4.5" />
              </div>
              <div className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600 shadow-sm">
                <Truck className="h-4.5 w-4.5" />
              </div>

              <motion.div
                initial={{ left: '2.2rem', opacity: 0, y: '-50%' }}
                animate={{ left: ['2.2rem', '50%', 'calc(100% - 3.7rem)'], opacity: [0, 1, 1], y: ['-50%', '-72%', '-50%'] }}
                transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-1/2 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-amber-500 shadow-[0_10px_24px_rgba(15,23,42,0.14)] ring-1 ring-amber-100"
              >
                <Package className="h-4 w-4" />
              </motion.div>

              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: [0, 7, 0], opacity: 1 }}
                transition={{ duration: 0.42, delay: 0.32, repeat: 1, repeatType: 'reverse', ease: 'easeInOut' }}
                className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-sky-600"
              >
                <Truck className="h-4.5 w-4.5" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
