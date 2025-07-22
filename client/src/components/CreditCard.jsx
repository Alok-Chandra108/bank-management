import React, { useRef } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useGesture } from '@use-gesture/react';

const CreditCard = ({ cardNumber, cardHolder, expiry, type }) => {
  const cardRef = useRef(null);

  const rotateX = useSpring(0, { stiffness: 60, damping: 15 });
  const rotateY = useSpring(0, { stiffness: 60, damping: 15 });
  const translateX = useSpring(0, { stiffness: 30, damping: 10 });
  const translateY = useSpring(0, { stiffness: 30, damping: 10 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const shimmerTransform = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `rotate(${(Math.atan2(y, x) * 180) / Math.PI}deg) scale(1.5)`
  );

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const bounds = cardRef.current.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    rotateY.set(deltaX / 3);
    rotateX.set(-deltaY / 3);

    const mouseXRelativeToCard = e.clientX - bounds.left;
    const mouseYRelativeToCard = e.clientY - bounds.top;

    const maxTranslate = 20;
    const mappedTranslateX = (mouseXRelativeToCard / bounds.width - 0.5) * (maxTranslate * 2);
    const mappedTranslateY = (mouseYRelativeToCard / bounds.height - 0.5) * (maxTranslate * 2);

    translateX.set(mappedTranslateX);
    translateY.set(mappedTranslateY);

    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    translateX.set(0);
    translateY.set(0);
    mouseX.set(0);
    mouseY.set(0);
  };

  useGesture(
    {
      onDrag: ({ xy: [x, y] }) => {
        if (!cardRef.current) return;
        const bounds = cardRef.current.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        const deltaX = x - centerX;
        const deltaY = y - centerY;

        rotateY.set(deltaX / 3);
        rotateX.set(-deltaY / 3);

        const touchX = x - bounds.left;
        const touchY = y - bounds.top;

        const maxTranslate = 20;
        const mappedTranslateX = (touchX / bounds.width - 0.5) * (maxTranslate * 2);
        const mappedTranslateY = (touchY / bounds.height - 0.5) * (maxTranslate * 2);

        translateX.set(mappedTranslateX);
        translateY.set(mappedTranslateY);

        mouseX.set(x - centerX);
        mouseY.set(y - centerY);
      },
      onDragEnd: () => {
        rotateX.set(0);
        rotateY.set(0);
        translateX.set(0);
        translateY.set(0);
        mouseX.set(0);
        mouseY.set(0);
      },
    },
    {
      target: cardRef,
      eventOptions: { passive: false },
      drag: { pointer: { touch: true } },
    }
  );

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      touchAction= 'none'
      style={{ rotateX, rotateY, translateX, translateY, transformStyle: 'preserve-3d' }}
      className="w-[350px] h-[220px] bg-gradient-to-br from-purple-800 to-black rounded-2xl p-6 text-white relative cursor-pointer z-10
                 shadow-2xl shadow-purple-700/50 hover:shadow-purple-600/70
                 flex flex-col justify-between items-start overflow-hidden
                 group border border-purple-700/50"
    >
      {/* Shimmer */}
      <motion.div
        style={{
          transform: shimmerTransform,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          mixBlendMode: 'overlay',
        }}
        className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
      />

      {/* Chip */}
      <div className="w-12 h-9 bg-yellow-400 rounded-sm absolute top-6 left-6 z-20" />

      {/* Name */}
      <div className="absolute top-6 right-6 text-right z-20">
        <div className="text-white text-lg font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5), -1px -1px 2px rgba(255,255,255,0.1)' }}>
          {cardHolder || 'CARD HOLDER'}
        </div>
      </div>

      {/* Card Number */}
      <div className="tracking-widest text-sm font-mono absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5), -1px -1px 2px rgba(255,255,255,0.1)' }}>
        {cardNumber || '**** **** **** ****'}
      </div>

      {/* Expiry */}
      <div className="absolute bottom-6 left-6 text-xs z-20">
        <div className="opacity-60">VALID THRU</div>
        <div style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5), -1px -1px 2px rgba(255,255,255,0.1)' }}>
          {expiry || '--/--'}
        </div>
      </div>

      {/* Logo */}
      <div className="absolute bottom-6 right-6 flex items-center justify-end z-20">
        <span className="font-extrabold text-2xl text-white tracking-tighter"
          style={{ textShadow: '0 0 10px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.2)' }}>
          {type || 'RuPay'}
        </span>
      </div>
    </motion.div>
  );
};

export default CreditCard;
