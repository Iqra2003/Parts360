import React from 'react';
import { LayoutDashboard, PlusSquare, Package, Image as ImageIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/add-part', icon: PlusSquare, label: 'Add Spare Part' },
        { path: '/parts', icon: Package, label: 'Parts' },
        { path: '/matching', icon: ImageIcon, label: 'Image Matching' },
    ];

    return (
        <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-100">
                <h1 className="text-xl font-bold text-indigo-600">Spare Parts</h1>
                <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-1">Matching System</p>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                        A
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">Admin User</p>
                        <p className="text-xs text-slate-500">admin@spareparts.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
