'use client';
import React from 'react';

const WorkSpaceLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full h-screen items-center justify-center ">
      <div className="h-[100vh] flex-1 ">{children}</div>
    </div>
  );
};

export default WorkSpaceLayout;
