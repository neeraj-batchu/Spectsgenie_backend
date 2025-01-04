import React, { useState, useEffect, useRef } from "react";
import { FaHeart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/spectsgenieSlice";
import LensType from "./LensType"; // Ensure the path is correct
import apiService from "../../services/api_services.js";
import { useParams, useNavigate } from "react-router-dom";
import auth_service from "../../../src/services/auth_service";
import VirtualTryOnModal from "./VirtualTryOnModal.js";
import SimilarProducts from "./SimilarProducts.js";
import { Toast } from "primereact/toast";
import "primereact/resources/themes/lara-light-blue/theme.css"; // Choose your theme
import "primereact/resources/primereact.min.css"; // Core CSS
import "primeicons/primeicons.css"; // Icons

const ProductDetails = () => {
  const { productId, categoryId } = useParams(); // Capture the product ID from the route parameter
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [productInfo, setProductInfo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [wishlist, setWishlist] = useState(false);
  const [isLensTypeOpen, setIsLensTypeOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [virtualTryOnModalState, setVirtualTryOnModalState] = useState(false);
  const [quantity, setQuantity] = useState(0); // New state for quantity
  const toast = useRef(null); // Ref for PrimeReact Toast

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        const response = await apiService.fetchProductById(productId, categoryId);
        if (response.success && response.data.length > 0) {
          const productData = response.data[0];
          const images = productData.pr_image
            ? productData.pr_image.split(",").map(
                (img) => `https://newpos.spectsgenie.com/${img}`
              )
            : []; // Fallback to an empty array if no images are available

          setProductInfo({
            id: productData.pr_id,
            ca_id: productData.ca_id,
            name: productData.name,
            pr_image: productData.pr_image,
            psd_files: productData.psd_files,
            slug: productData.slug,
            img: images[productData.selected_image_to_show || 0], // Default to the first image
            images,
            description: productData.pr_description || "No description available",
            price: parseFloat(productData.pr_sprice) || 0, // Fallback to 0 if price is invalid
            colors: response.similarProducts.map((item) => ({
              slug: item.slug,
              pr_id: item.pr_id,
            })),
          });

          setSelectedImage(
            images[productData.selected_image_to_show || 0] || null
          );

          // Fetch wishlist status
          const customerId = auth_service.getAccessTokenData()?.id;
          if (customerId) {
            const wishlistResponse = await apiService.fetchWishListStatusById(productData.pr_id, customerId);
            if (wishlistResponse.data.length > 0) {
              setWishlist(wishlistResponse.data.status === "active");
              setWishlist(true);
            } else {
              setWishlist(false);
            }
          }
        } else {
          console.warn("No product data found.");
        }
      } catch (error) {
        console.error("Error fetching filtered products:", error);
      }
    };

    fetchFilteredProducts();
  }, [productId, categoryId]);

  const handleImageChange = (image) => {
    setSelectedImage(image);
  };

  const allColors = {
    black: "#000",
    white: "#fff",
    brown: "#964B00",
    grey: "#808080",
    purple: "#A020F0",
    green: "#008000",
    pink: "#FFC0CB",
    blue: "#4169E1",
    red: "#ff2800",
    yellow: "#FFFF00",
  };

  const getSimilarProductIconColor = (slug) => {
    const colorKeys = Object.keys(allColors);

    for (let i = 0; i < colorKeys.length; i++) {
      if (slug.toLowerCase().includes(colorKeys[i])) {
        return allColors[colorKeys[i]];
      }
    }

    return "#000";
  };

  const toggleWishlist = async () => {
    let customerId;
    try {
      const { id } = auth_service.getAccessTokenData();
      customerId = id;

      if (!customerId) {
        console.error("Customer ID is undefined.");
        return;
      }
    } catch (error) {
      console.error("Error retrieving customer ID:", error);
      return;
    }

    const payload = {
      product_id: productInfo.id,
      customer_id: customerId,
    };

    try {
      if (wishlist) {
        const response = await apiService.removeProductFromWishlist(payload);
        if (response.success) {
          setWishlist(false);
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "Product removed from wishlist!",
            life: 3000,
          });
        } else {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to remove product from wishlist. Please try again.",
            life: 3000,
          });
        }
      } else {
        const response = await apiService.addProductToWishlist(payload);
        if (response.success) {
          setWishlist(true);
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "Product added to wishlist!",
            life: 3000,
          });
        } else {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to add product to wishlist. Please try again.",
            life: 3000,
          });
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const handleAddToCart = () => {
    if (productInfo) {
      dispatch(
        addToCart({
          productId: productInfo.id,
          name: productInfo.name,
          quantity: 1,
          image: productInfo.img,
          price: productInfo.price,
          colors: productInfo.colors,
        })
      );
      setIsLensTypeOpen(true);
    }
  };

  const handleColorClick = (colorObj) => {
    setSelectedColor(colorObj.slug);
    navigate(`/product/${colorObj.pr_id}`, {
      state: { product: colorObj },
    });
  };

  const handleQuantityChange = (increment) => {
    setQuantity((prevQuantity) => Math.max(0, prevQuantity + increment));
  };

  return (
    <div className="w-full mx-auto bg-white">
      <Toast ref={toast} position="top-center" />
      {productInfo ? (
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 bg-gray-50 rounded-lg shadow-lg gap-4">
          <div className="col-span-1 md:col-span-2 xl:col-span-6 flex flex-col items-center bg-white rounded-lg overflow-hidden relative">
            <img
              className="w-full max-h-[500px] object-contain mb-4"
              src={selectedImage}
              alt={productInfo.name || "Product Image"}
            />
            <div className="flex flex-row justify-center gap-4">
              {productInfo.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Thumbnail ${index}`}
                  className={`w-16 h-16 object-cover cursor-pointer border ${
                    selectedImage === image ? "border-blue-500" : "border-gray-300"
                  } rounded-lg`}
                  onClick={() => handleImageChange(image)}
                />
              ))}
            </div>
            <button
              className={`absolute top-4 right-4 text-xl focus:outline-none ${
                wishlist ? "text-red-500" : "text-gray-500"
              }`}
              onClick={toggleWishlist}
            >
              <FaHeart />
            </button>
          </div>

          <div className="col-span-1 md:col-span-2 xl:col-span-6 flex flex-col justify-start gap-4 p-6 bg-white rounded-lg">
            <h1 className="text-4xl font-bold text-gray-900">{productInfo.name}</h1>
            <p className="text-xl font-bold text-gray-500">{productInfo.description}</p>

            {categoryId === "3" ? (
              <div className="mt-4">
                <div className="flex items-center gap-4">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                    onClick={() => handleQuantityChange(-1)}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                    onClick={() => handleQuantityChange(1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="w-full py-4 mt-4 bg-blue-600 text-white rounded-lg"
                >
                  Continue
                </button>
              </div>
            ) : (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-primeColor hover:bg-black transition duration-300 text-white text-lg rounded-lg"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => setVirtualTryOnModalState(true)}
                  className="w-full py-4"
                  style={{
                    backgroundColor: "#063970",
                    color: "white",
                    borderRadius: "0.5rem",
                    fontSize: "1.2rem",
                  }}
                >
                  Virtual Try On
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}

      <div className="max-w-container mx-auto px-4 gap-4"></div>

      {productInfo && productInfo.ca_id && productInfo.id && categoryId !== "3" ? (
        <div className="max-w-container mx-auto px-4 gap-4">
          <SimilarProducts ca_id={productInfo.ca_id} pr_id={productInfo.id} />
        </div>
      ) : null}

      {virtualTryOnModalState && (
        <VirtualTryOnModal
          setModalState={setVirtualTryOnModalState}
          pr_images={productInfo.pr_image}
          psd_files={productInfo.psd_files}
        />
      )}

      {isLensTypeOpen && (
        <LensType
          isOpen={isLensTypeOpen}
          onClose={() => setIsLensTypeOpen(false)}
          productInfo={productInfo}
        />
      )}
    </div>
  );
};

export default ProductDetails;
