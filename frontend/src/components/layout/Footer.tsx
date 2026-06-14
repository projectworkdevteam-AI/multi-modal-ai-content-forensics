export default function Footer() {
  return (
    <footer className="bg-slate-100 text-slate-600 p-6 text-center text-sm border-t border-slate-200 mt-auto">
      <div className="container mx-auto">
        &copy; {new Date().getFullYear()} Multi-Modal AI Content Forensics Platform.
      </div>
    </footer>
  );
}
