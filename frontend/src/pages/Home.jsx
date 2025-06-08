function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div>
        <h1>This is home page</h1>
        <div className="text-white">{`User: usename`}</div>
      </div>
    </div>
  );
}

export default Home;
