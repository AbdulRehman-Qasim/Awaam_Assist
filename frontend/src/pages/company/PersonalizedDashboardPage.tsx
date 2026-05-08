import PersonalizedDashboard from "@/components/dashboard/PersonalizedDashboard";
import ErrorBoundary from "@/components/dashboard/ErrorBoundary";

const PersonalizedDashboardPage = () => {
  return (
    <div className="w-full">
      <ErrorBoundary>
        <PersonalizedDashboard />
      </ErrorBoundary>
    </div>
  );
};

export default PersonalizedDashboardPage;
