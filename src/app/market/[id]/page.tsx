import React from "react";
import MarketDetailView from "./MarketDetailView";

// Static export requires generateStaticParams for dynamic routes
export async function generateStaticParams() {
    return [{ id: "placeholder" }];
}

export default function ProductDetailPage() {
    return <MarketDetailView />;
}
