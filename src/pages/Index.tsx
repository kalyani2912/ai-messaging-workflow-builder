
import Layout from "../components/Layout";
import HeroSection from "../components/home/HeroSection";
import HowItWorks from "../components/home/HowItWorks";
import KeyFeatures from "../components/home/KeyFeatures";
import ExampleCarousel from "../components/home/ExampleCarousel";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <HowItWorks />
      <KeyFeatures />
      <ExampleCarousel />
    </Layout>
  );
};

export default Index;
