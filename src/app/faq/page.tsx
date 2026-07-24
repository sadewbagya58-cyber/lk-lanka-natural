'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Plus, Minus, HelpCircle, MessageSquare, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: 'General Shopping',
    items: [
      {
        id: 'place-order',
        question: 'How do I place an order?',
        answer: 'Browse our catalog of natural products, add items to your shopping cart, and navigate to the checkout page. Enter your delivery coordinates and customer details, choose your payment option, and click "Place Order" to finalize.',
      },
      {
        id: 'view-details',
        question: 'How do I view product details?',
        answer: 'Simply click on any product card from our homepage or category listing. This will open the detailed product page where you can read descriptions, view images, inspect options, and check stock status.',
      },
      {
        id: 'add-cart',
        question: 'How do I add products to my cart?',
        answer: 'On any standard product page, select your desired variant options (if applicable) and click the "Add to Cart" button. You can then access your shopping cart anytime via the drawer icon in the header.',
      },
      {
        id: 'buy-now',
        question: 'How does Buy Now work?',
        answer: 'Clicking the "Buy Now" button on a product detail page bypasses the normal cart drawer and immediately directs you to the checkout screen with just that single item. This is perfect for single-item checkouts and is mandatory for Custom Portrait Art orders.',
      },
    ],
  },
  {
    title: 'Custom Portrait Art',
    items: [
      {
        id: 'custom-art-what',
        question: 'What is Custom Portrait Art?',
        answer: 'Custom Portrait Art products are made-to-order custom artwork services. The items listed in this category serve as design and style samples. Our professional artists create a personalized artwork similar to the sample design style based on the photo you submit.',
      },
      {
        id: 'custom-art-how',
        question: 'How does Custom Portrait Art ordering work?',
        answer: 'Choose a style sample from the Custom Portrait Art category, specify your options, and click "Buy Now". During checkout, a required "Customer Reference Photo" card will appear, prompting you to upload your reference photo before placing your order.',
      },
      {
        id: 'custom-art-buynow',
        question: 'Why can Custom Portrait Art products only be purchased using Buy Now?',
        answer: 'Since custom artwork requires a dedicated, singular reference photo upload per checkout session, these products cannot be combined with general shopping cart items. This ensures your custom instructions and reference images are accurately stored with the specific item.',
      },
      {
        id: 'custom-art-upload',
        question: 'How do I upload my reference photo?',
        answer: 'After clicking "Buy Now" on a Custom Portrait Art item, you will be taken to the checkout page. Scroll to the "Customer Reference Photo" section, click or drag-and-drop your image file into the dashed box to upload it.',
      },
      {
        id: 'custom-art-file',
        question: 'What type of image can I upload?',
        answer: 'We accept files in JPG, JPEG, PNG, and WEBP formats, with a maximum file size of 10MB. For the best final output, we recommend uploading a high-resolution, clear, and well-lit photo.',
      },
      {
        id: 'custom-art-privacy',
        question: 'What happens to my uploaded reference image?',
        answer: 'Your uploaded reference image is stored securely and attached to your order record. It is accessed strictly by our design team and professional artists to create your custom portrait. We respect your privacy and do not share your reference photos with any third parties.',
      },
    ],
  },
  {
    title: 'Delivery & Shipping',
    items: [
      {
        id: 'delivery-sl',
        question: 'Do you deliver within Sri Lanka?',
        answer: 'Yes, we provide standard courier delivery services island-wide across all provinces and districts in Sri Lanka. Standard delivery fees are automatically calculated at checkout.',
      },
      {
        id: 'delivery-int',
        question: 'Do you offer international shipping?',
        answer: 'Yes, we offer shipping options for international customers. During checkout, select "International / Other Country" as your country destination to view available options.',
      },
      {
        id: 'delivery-int-cost',
        question: 'How are international shipping costs handled?',
        answer: 'To ensure accuracy, international shipping rates are quoted after your order is submitted. Once you place the order, our help desk will determine shipping parameters and contact you at kllankanatural@gmail.com with your shipping quote.',
      },
      {
        id: 'delivery-address',
        question: 'How can I provide the correct delivery address?',
        answer: 'When placing your order, please complete all address fields accurately. For Sri Lankan addresses, select your province and district carefully from the dropdown menus to ensure efficient routing.',
      },
    ],
  },
  {
    title: 'Payments',
    items: [
      {
        id: 'payment-methods',
        question: 'What payment methods are currently available?',
        answer: 'We currently accept Cash on Delivery (COD) for eligible deliveries within Sri Lanka. Direct Bank Transfer has been removed completely, and online card payments are currently being prepared.',
      },
      {
        id: 'payment-cod',
        question: 'Is Cash on Delivery available?',
        answer: 'Yes, Cash on Delivery is fully operational and available for orders within Sri Lanka.',
      },
      {
        id: 'payment-card',
        question: 'Is online card payment available?',
        answer: 'Online card payment functionality is currently in preparation and is temporarily unavailable until our secure card payment gateway integration is connected. We appreciate your patience.',
      },
    ],
  },
  {
    title: 'Orders & Support',
    items: [
      {
        id: 'order-history',
        question: 'Can I view my order history?',
        answer: 'Yes! If you created an account, you can log in and visit your "My Orders" panel under your Account section to view a complete list of your past order details, including product options and uploaded reference photos.',
      },
      {
        id: 'order-dispatch',
        question: 'What happens after placing an order?',
        answer: 'You will receive an order confirmation. Our team will verify the details, package the items (or begin custom artwork creation), and hand it over to our courier partner. You will be updated regarding the status.',
      },
      {
        id: 'order-support',
        question: 'How can I contact support?',
        answer: 'For any questions, order updates, or help, please contact our help desk via our confirmed support email: kllankanatural@gmail.com. We do not offer support over phone or WhatsApp.',
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    items: [
      {
        id: 'refund-policy',
        question: 'What is your return and refund policy?',
        answer: 'We accept returns for damaged, incorrect, or defective products. Eligible items must be reported to our support email with proof (such as images of the issue). Due to the customized nature of Custom Portrait Art products, they are generally non-returnable once creation has begun.',
      },
    ],
  },
  {
    title: 'Product Quality',
    items: [
      {
        id: 'quality-authentic',
        question: 'Are your products authentic?',
        answer: 'Yes, KL Lanka Natural is dedicated to sourcing genuine products. We partner directly with verified brands, local makers, and reputable suppliers to ensure absolute authenticity.',
      },
      {
        id: 'quality-herbal',
        question: 'Are natural and herbal products safe?',
        answer: 'All our health and herbal products list their natural ingredients. While we focus on safe, traditional wellness ingredients, we do not make medical claims or guarantees. We recommend consulting a healthcare practitioner for specific health concerns.',
      },
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter FAQ based on search
  const filteredCategories = FAQ_DATA.map((cat) => {
    const matchedItems = cat.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...cat,
      items: matchedMatchedItems(matchedItems),
    };
  }).filter((cat) => cat.items.length > 0);

  function matchedMatchedItems(items: FAQItem[]) {
    return items;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs font-black text-slate-450 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300" />
          <span className="text-slate-800">FAQs</span>
        </nav>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-800 to-teal-950 text-white p-8 sm:p-12 mb-10 shadow-sm text-center flex flex-col items-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent)] pointer-events-none" />
          <div className="max-w-xl relative z-10 flex flex-col items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-900/50 px-3 py-1 rounded-full w-fit border border-emerald-500/30">
              Information Desk
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Frequently Asked Questions
              </h1>
            <p className="text-xs text-emerald-100 font-light leading-relaxed mt-1">
              Find instant answers to common questions about ordering, custom portrait uploads, payments, and delivery.
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-md mt-6 relative flex items-center bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
              <span className="pl-4 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions or keywords..."
                className="w-full px-3.5 py-3 text-xs sm:text-sm focus:outline-none font-medium bg-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Accordions */}
        <div className="flex flex-col gap-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <h2 className="text-xs font-black text-emerald-600 uppercase tracking-widest px-1">
                  {cat.title}
                </h2>
                <div className="flex flex-col gap-2.5">
                  {cat.items.map((item) => {
                    const isExpanded = !!expandedIds[item.id];
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-150/80 rounded-2xl overflow-hidden shadow-2xs hover:border-slate-300/80 transition-colors"
                      >
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-800 focus:outline-none hover:bg-slate-50/40 select-none"
                        >
                          <span className="leading-snug">{item.question}</span>
                          <span className="shrink-0 text-slate-400">
                            {isExpanded ? <Minus className="w-4 h-4 text-emerald-650" /> : <Plus className="w-4 h-4" />}
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-50 leading-relaxed font-medium bg-slate-50/30">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center flex flex-col items-center gap-4 max-w-md mx-auto my-6 shadow-sm">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">No results found</h3>
                <p className="text-xs text-slate-450 mt-1 leading-relaxed">
                  We couldn&apos;t find any FAQs matching &quot;{searchQuery}&quot;. Try using different terms or contact support directly.
                </p>
              </div>
              <Link
                href="/contact"
                className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95"
              >
                Submit an Inquiry
              </Link>
            </div>
          )}
        </div>

        {/* Contact Help Desk Prompt */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 mt-12 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col gap-1.5 sm:max-w-md">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 justify-center sm:justify-start">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Still have questions?</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              If you can&apos;t find the answer you are looking for, send an email to our support team.
            </p>
          </div>
          <div className="flex items-center gap-3.5 bg-slate-50 py-3.5 px-4.5 rounded-xl border border-slate-150 shrink-0">
            <Mail className="w-4.5 h-4.5 text-emerald-650 shrink-0" />
            <div className="text-left flex flex-col">
              <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider leading-none">Official Support</span>
              <a href="mailto:kllankanatural@gmail.com" className="text-xs font-bold text-slate-900 hover:text-emerald-600 hover:underline mt-0.5 break-all">
                kllankanatural@gmail.com
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
