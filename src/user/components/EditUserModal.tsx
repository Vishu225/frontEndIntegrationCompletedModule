import { JSX, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../shared/axiosInstance";

export interface EditableUser {
  userId: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: string;
}

interface EditUserModalProps {
  user: EditableUser;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({
  user,
  onClose,
  onSuccess,
}: EditUserModalProps): JSX.Element {
  const [form, setForm] = useState({
    department: user.department,
    role: user.role,
    status: user.status,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.put<string>("/updateUserAdmin", {
        email: user.email,
        ...form,
      });
      toast.success(
        typeof res.data === "string" ? res.data : "User updated successfully!",
      );
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const e = error as { response?: { data?: unknown } };
      const msg =
        typeof e.response?.data === "string"
          ? e.response.data
          : (e.response?.data as { message?: string })?.message ||
            "Failed to update user.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="results-modal animate__animated animate__zoomIn animate__faster"
        style={{ maxWidth: 460 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="results-modal-header">
          <h2
            className="fw-bold mb-0"
            style={{ color: "var(--primary-navy)", fontSize: "1.1rem" }}
          >
            <i className="bi bi-pencil-square me-2" />
            Edit User
          </h2>
          <button onClick={onClose} className="action-btn close-btn">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="results-modal-body">
          <div
            className="mb-4 p-3"
            style={{
              background: "var(--bg-cream)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <p
              className="fw-semibold mb-0"
              style={{ color: "var(--primary-navy)" }}
            >
              {user.name}
            </p>
            <p
              className="mb-0"
              style={{ color: "var(--muted-text)", fontSize: "0.85rem" }}
            >
              {user.email}
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Department</label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div className="form-group mb-3">
              <label>Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="form-group mb-4">
              <label>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div className="d-flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-grad"
                style={{ flex: 1, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="action-btn close-btn"
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-md)",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
