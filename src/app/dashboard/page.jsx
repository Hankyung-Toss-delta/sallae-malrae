import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      <Header activeMenu="dashboard" />

      <section className="min-h-[600px]">{/* 대시보드 내용 */}</section>

      <Footer />
    </main>
  );
}
