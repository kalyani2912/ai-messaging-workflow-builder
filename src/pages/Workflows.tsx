
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "../components/Layout";
import WorkflowListTable from "../components/workflows/WorkflowListTable";
import { Plus } from "lucide-react";

const Workflows = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Workflows</h1>
            <p className="text-gray-600">
              All your messaging workflows in one place. Click on any to view details, dashboards, or continue the conversation.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button asChild size="lg" className="flex items-center">
              <Link to="/create-workflow">
                <Plus className="h-5 w-5 mr-2" /> Create New Workflow
              </Link>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <WorkflowListTable />
        </div>
      </div>
    </Layout>
  );
};

export default Workflows;
