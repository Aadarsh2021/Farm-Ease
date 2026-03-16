"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductDetailClient, { ProductType } from "./ProductDetailClient";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function MarketDetailView() {
    const params = useParams();
    const productId = params.id as string;
    const [product, setProduct] = useState<ProductType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProduct() {
            if (!productId) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select("*")
                    .eq("id", productId)
                    .single();

                if (error || !data) {
                    console.error("Error fetching product:", error);
                    setProduct(null);
                } else {
                    const formattedProduct: ProductType = {
                        id: data.id,
                        name: data.name,
                        price: data.price,
                        unit: data.unit,
                        stock: data.stock,
                        category: data.category,
                        vendor: data.seller_id.startsWith("vendor_") ? data.seller_id.replace("vendor_", "").replace("_", " ").toUpperCase() : "Verified Farmer",
                        vendor_id: data.seller_id,
                        image: data.image_url || "",
                        description: data.description || "No description provided.",
                        location: "Verified Location",
                        rating: 4.5,
                        reviews: 0
                    };
                    setProduct(formattedProduct);
                }
            } catch (err) {
                console.error("Catch error fetching product:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [productId]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
                <Loader2 size={40} className="animate-spin text-green-500 mb-4" />
                <p className="text-gray-500 font-medium text-lg">Loading crop details...</p>
            </div>
        );
    }

    return <ProductDetailClient product={product} />;
}
