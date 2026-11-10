import { r as __toESM } from "../_runtime.mjs";
import { i as startDemoSession, n as endDemoSession, r as isDemoSession, t as api } from "./api-DOfBQFpN.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as LanternLoader } from "./LanternLoader-iKRSqvr0.mjs";
import { t as IngredientSearch } from "./IngredientSearch-CyQL7C7_.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-CyoZOGFj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RESTRICTIONS = [
	"vegetarian",
	"vegan",
	"gluten free",
	"dairy free",
	"halal",
	"peanut",
	"tree nut",
	"egg",
	"shellfish",
	"soy",
	"fish"
];
var EMPTY_FORM = {
	restrictions: [],
	also_avoid: "",
	likes: "",
	dislikes: "",
	cuisines: "",
	budget: ""
};
function AccountPage() {
	const navigate = useNavigate();
	const [checking, setChecking] = (0, import_react.useState)(true);
	const [user, setUser] = (0, import_react.useState)(null);
	const [demoMode, setDemoMode] = (0, import_react.useState)(false);
	const [sessionError, setSessionError] = (0, import_react.useState)(null);
	function continueInDemoMode() {
		startDemoSession();
		navigate({ to: "/search" });
	}
	(0, import_react.useEffect)(() => {
		if (isDemoSession()) {
			setDemoMode(true);
			setChecking(false);
			return;
		}
		let cancelled = false;
		async function checkSession() {
			try {
				const { user } = await api("/api/auth/session");
				if (!cancelled) setUser(user);
			} catch (error) {
				console.error(error);
				if (!cancelled) setSessionError("Couldn't verify your session. Check your connection and try again.");
			} finally {
				if (!cancelled) setChecking(false);
			}
		}
		checkSession();
		return () => {
			cancelled = true;
		};
	}, []);
	if (checking) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanternLoader, { label: "Opening the gate…" }), false]
	});
	if (sessionError && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-4 py-12 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm text-destructive",
				children: sessionError
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => window.location.reload(),
				className: "mt-4 rounded-xl px-5 py-2.5 text-sm font-semibold",
				style: {
					background: "var(--gold)",
					color: "var(--forest-dark)"
				},
				children: "Try again"
			}),
			false
		]
	});
	return demoMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoPanel, {
		onContinue: () => navigate({ to: "/search" }),
		onSignedOut: () => setDemoMode(false)
	}) : user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfilePanel, {
		user,
		onSignedOut: () => {
			setUser(null);
			navigate({ to: "/account" });
		}
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthPanel, { onContinueInDemo: continueInDemoMode });
}
function AuthPanel({ onContinueInDemo }) {
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [notice, setNotice] = (0, import_react.useState)(null);
	async function submit(e) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		setNotice(null);
		try {
			if (mode === "signup") {
				await api("/api/auth/register", {
					method: "POST",
					body: JSON.stringify({
						email,
						password
					})
				});
				window.location.reload();
			} else {
				await api("/api/auth/login", {
					method: "POST",
					body: JSON.stringify({
						email,
						password
					})
				});
				window.location.reload();
			}
		} catch (e) {
			const message = e instanceof Error ? e.message : "Something went wrong. Try again.";
			setError(message);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-md px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl p-6 shadow-lg",
			style: {
				background: "var(--card)",
				color: "var(--card-foreground)"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-bold",
					children: mode === "signin" ? "Welcome back" : "Join the grove"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-ink/60",
					children: mode === "signin" ? "Sign in to your pantry." : "Create an account with email and password."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex gap-2",
					role: "tablist",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						role: "tab",
						"aria-selected": mode === "signin",
						onClick: () => setMode("signin"),
						className: "rounded-full px-4 py-1.5 text-sm font-medium",
						style: mode === "signin" ? {
							background: "var(--gold)",
							color: "var(--forest-dark)"
						} : {
							background: "var(--parchment-dark)",
							color: "var(--ink)"
						},
						children: "Sign in"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						role: "tab",
						"aria-selected": mode === "signup",
						onClick: () => setMode("signup"),
						className: "rounded-full px-4 py-1.5 text-sm font-medium",
						style: mode === "signup" ? {
							background: "var(--gold)",
							color: "var(--forest-dark)"
						} : {
							background: "var(--parchment-dark)",
							color: "var(--ink)"
						},
						children: "Sign up"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "mt-5 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "email",
							className: "text-sm font-medium",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "email",
							type: "email",
							required: true,
							value: email,
							onChange: (e) => setEmail(e.target.value),
							className: "mt-1 w-full rounded-lg border px-3 py-2 text-base text-ink outline-none focus:ring-2",
							style: {
								background: "var(--parchment)",
								borderColor: "var(--parchment-dark)"
							}
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "password",
							className: "text-sm font-medium",
							children: "Password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "password",
							type: "password",
							required: true,
							minLength: 6,
							value: password,
							onChange: (e) => setPassword(e.target.value),
							className: "mt-1 w-full rounded-lg border px-3 py-2 text-base text-ink outline-none focus:ring-2",
							style: {
								background: "var(--parchment)",
								borderColor: "var(--parchment-dark)"
							}
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy,
							className: "w-full rounded-xl px-5 py-3 text-sm font-semibold shadow-md disabled:opacity-60",
							style: {
								background: "var(--gold)",
								color: "var(--forest-dark)"
							},
							children: busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"
						})
					]
				}),
				notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 rounded-lg px-4 py-3 text-sm",
					style: { background: "var(--gold-soft)" },
					children: notice
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 rounded-lg px-4 py-3 text-sm",
					style: {
						background: "var(--destructive)",
						color: "var(--destructive-foreground)"
					},
					children: error
				}),
				false
			]
		})
	});
}
function DemoPanel({ onContinue, onSignedOut }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-md px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl p-6 shadow-lg",
			style: {
				background: "var(--card)",
				color: "var(--card-foreground)"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-bold",
					children: "Local demo mode"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "You can explore recipe matching without creating an account. Profile preferences and sign-in features are not saved in demo mode."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onContinue,
					className: "mt-5 w-full rounded-xl px-5 py-3 text-sm font-semibold shadow-md",
					style: {
						background: "var(--gold)",
						color: "var(--forest-dark)"
					},
					children: "Continue to your pantry"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						endDemoSession();
						onSignedOut();
					},
					className: "mt-3 w-full rounded-xl border px-5 py-3 text-sm font-medium",
					style: { borderColor: "var(--input)" },
					children: "Exit demo mode"
				})
			]
		})
	});
}
function ProfilePanel({ user, onSignedOut }) {
	const [form, setForm] = (0, import_react.useState)(EMPTY_FORM);
	const [status, setStatus] = (0, import_react.useState)("loading");
	const [loadAttempt, setLoadAttempt] = (0, import_react.useState)(0);
	const [signOutError, setSignOutError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function loadProfile() {
			try {
				const { profile } = await api("/api/profile");
				if (cancelled) return;
				setForm({
					restrictions: profile?.restrictions ?? [],
					also_avoid: profile?.alsoAvoid ?? "",
					likes: profile?.likes ?? "",
					dislikes: profile?.dislikes ?? "",
					cuisines: profile?.cuisines ?? "",
					budget: profile?.budget != null ? String(profile.budget) : ""
				});
				setStatus("ready");
			} catch (error) {
				console.error(error);
				if (!cancelled) setStatus("load-error");
			}
		}
		loadProfile();
		return () => {
			cancelled = true;
		};
	}, [user.id, loadAttempt]);
	async function save(e) {
		e.preventDefault();
		setStatus("saving");
		try {
			const budgetNum = parseFloat(form.budget);
			await api("/api/profile", {
				method: "PUT",
				body: JSON.stringify({
					restrictions: form.restrictions,
					also_avoid: form.also_avoid || null,
					likes: form.likes || null,
					dislikes: form.dislikes || null,
					cuisines: form.cuisines || null,
					budget: Number.isFinite(budgetNum) ? budgetNum : null
				})
			});
			setStatus("saved");
		} catch (error) {
			console.error(error);
			setStatus("save-error");
		}
	}
	async function signOut() {
		setSignOutError(null);
		try {
			await api("/api/auth/logout", { method: "POST" });
			onSignedOut();
		} catch (error) {
			console.error(error);
			setSignOutError("Couldn't sign out. Please try again.");
		}
	}
	if (status === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-3xl px-4 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanternLoader, { label: "Reading your profile…" })
	});
	function toggleRestriction(r) {
		setForm((f) => ({
			...f,
			restrictions: f.restrictions.includes(r) ? f.restrictions.filter((x) => x !== r) : [...f.restrictions, r]
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-bold",
					style: { color: "var(--gold)" },
					children: "Your Profile"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: signOut,
					className: "rounded-lg border px-4 py-2 text-sm",
					style: {
						borderColor: "var(--input)",
						color: "var(--parchment)"
					},
					children: "Sign out"
				})]
			}),
			signOutError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-3 text-right text-sm text-destructive",
				children: signOutError
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: user.email
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: save,
				className: "mt-6 space-y-6 rounded-2xl p-6 shadow-lg",
				style: {
					background: "var(--card)",
					color: "var(--card-foreground)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "text-sm font-semibold",
						children: "Restrictions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3",
						children: RESTRICTIONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-sm capitalize",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: form.restrictions.includes(r),
								onChange: () => toggleRestriction(r),
								className: "h-4 w-4 accent-[var(--moss)]"
							}), r]
						}, r))
					})] }),
					status === "load-error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "alert",
						className: "rounded-lg p-3 text-sm text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Your saved profile couldn't be loaded. Your settings are unchanged; retry before saving." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setStatus("loading");
								setLoadAttempt((attempt) => attempt + 1);
							},
							className: "mt-2 underline",
							children: "Retry loading profile"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileIngredientField, {
						id: "also_avoid",
						label: "Also avoid",
						hint: "Choose ingredients from the catalog.",
						value: form.also_avoid,
						onChange: (value) => setForm((f) => ({
							...f,
							also_avoid: value
						}))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileIngredientField, {
						id: "likes",
						label: "Likes",
						hint: "Choose ingredients from the catalog.",
						value: form.likes,
						onChange: (value) => setForm((f) => ({
							...f,
							likes: value
						}))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileIngredientField, {
						id: "dislikes",
						label: "Dislikes",
						hint: "Recipes containing these ingredients are hidden.",
						value: form.dislikes,
						onChange: (value) => setForm((f) => ({
							...f,
							dislikes: value
						}))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
						id: "cuisines",
						label: "Favorite cuisines",
						hint: "e.g. italian, chinese, middle eastern",
						value: form.cuisines,
						onChange: (v) => setForm((f) => ({
							...f,
							cuisines: v
						}))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "budget",
						className: "text-sm font-medium",
						children: "Budget (USD per meal)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "budget",
						type: "number",
						min: 0,
						step: "0.25",
						value: form.budget,
						onChange: (e) => setForm((f) => ({
							...f,
							budget: e.target.value
						})),
						className: "mt-1 w-40 rounded-lg border px-3 py-2 text-base text-ink outline-none focus:ring-2",
						style: {
							background: "var(--parchment)",
							borderColor: "var(--parchment-dark)"
						}
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: status === "saving" || status === "load-error",
								className: "rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md disabled:opacity-60",
								style: {
									background: "var(--gold)",
									color: "var(--forest-dark)"
								},
								children: status === "saving" ? "Saving…" : "Save profile"
							}),
							status === "saved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm",
								style: { color: "var(--moss)" },
								children: "Saved ✓"
							}),
							status === "save-error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm",
								style: { color: "var(--destructive)" },
								children: "Couldn't save — try again."
							})
						]
					})
				]
			})
		]
	});
}
function TextField({ id, label, hint, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: id,
			className: "text-sm font-medium",
			children: label
		}),
		hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-ink/50",
			children: hint
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			id,
			type: "text",
			value,
			onChange: (e) => onChange(e.target.value),
			className: "mt-1 w-full rounded-lg border px-3 py-2 text-base text-ink outline-none focus:ring-2",
			style: {
				background: "var(--parchment)",
				borderColor: "var(--parchment-dark)"
			}
		})
	] });
}
function ProfileIngredientField({ id, label, hint, value, onChange }) {
	const selected = value.split(/[,;\n]/).map((ingredient) => ingredient.trim()).filter(Boolean);
	function updateSelected(next) {
		onChange(next.join(", "));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: id,
			className: "text-sm font-medium",
			children: label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-ink/50",
			children: hint
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IngredientSearch, {
				selected,
				onAdd: (ingredient) => updateSelected(selected.includes(ingredient) ? selected : [...selected, ingredient]),
				onRemove: (ingredient) => updateSelected(selected.filter((selectedIngredient) => selectedIngredient !== ingredient)),
				allowCustom: false,
				placeholder: "Search ingredients",
				ariaLabel: label,
				inputId: id
			})
		})
	] });
}
//#endregion
export { AccountPage as component };
