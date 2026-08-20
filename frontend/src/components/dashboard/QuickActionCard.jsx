import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function QuickActionCard({
    title,
    description,
    icon: Icon,
    to,
}) {
    return (

        <Link
            to={to}
            className="block rounded-2xl bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-hover"
        >

            <div className="flex items-center justify-between">

                <div>

                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-accent">

                        <Icon size={24} />

                    </div>

                    <h3 className="text-lg font-semibold text-heading">
                        {title}
                    </h3>

                    <p className="mt-2 text-sm text-muted">
                        {description}
                    </p>

                </div>

                <ArrowRight className="text-muted"/>

            </div>

        </Link>

    );
}

export default QuickActionCard;