/* eslint-disable no-unused-vars */
import React from 'react';
import AboutImg from '../../assets/pictures/img3.jpg';

function About() {
    return (
        <section id="about" className="py-10 bg-slate-100 dark:bg-slate-900 dark:text-white">
            <h2
                data-aos="fade-up"
                className="text-center text-4xl font-bold mb-10"
            >
                About Us
            </h2>
            <main className="container mx-auto flex flex-col items-center justify-center">

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-4 md:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <div data-aos="fade-right">
                        <img
                            src={AboutImg}
                            alt="No image"
                            className="w-full h-80 object-cover rounded-lg"
                        />
                    </div>
                    <div data-aos="fade-left" className="flex flex-col gap-4">
                        <div className="p-4 border-l-4 border-primary">
                            <h3 className="text-2xl font-semibold mb-2">Us</h3>
                            <p className="text-sm dark:text-slate-400">
                            A professional transport company operating in major cities in Rwanda & East Africa. 
                            Provide a more comfortable and we drive our customers to their destination on time.
                            </p>
                        </div>
                        <div className="p-4 border-l-4 border-primary">
                            <h3 className="text-2xl font-semibold mb-2">Vision</h3>
                            <p className="text-sm dark:text-slate-400">
                            Our vision is to become the leading regional transport provider in East Africa, expanding services to more countries, or being recognized for innovation in passenger transport and logistics.
                            </p>
                        </div>
                        <div className="p-4 border-l-4 border-primary">
                            <h3 className="text-2xl font-semibold mb-2">Mission</h3>
                            <p className="text-sm dark:text-slate-400">
                            Our mission is to focus on providing affordable, reliable transportation services in East Africa, ensuring customer satisfaction through efficient and timely travel.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </section>
    );
}

export default About;
