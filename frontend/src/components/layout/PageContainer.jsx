function PageContainer({ children }) {
  return (
    <div className="w-full px-6 py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-[1800px]">
        {children}
      </div>
    </div>
  );
}

export default PageContainer;