// about_us.js — About page: public board list, with inline editing for admins

let boardMembers = [];

async function loadPublicBoardMembers() {
    const container = document.getElementById('publicBoardMembersList');
    if (!container) return;

    try {
        const response = await apiFetch('/api/v1/board');
        boardMembers = response.data || [];

        if (boardMembers.length === 0) {
            container.innerHTML = '<p class="text-white/60">No board members yet.</p>';
            return;
        }

        const user = getStoredUser();
        const isAdmin = user?.role === 'admin';

        container.innerHTML = boardMembers.map((member, index) => {
            const delay = (index % 5) * 100 + 100;
            const imageSrc = member.image && member.image !== '/images/default-avatar.png' ? member.image : '/images/Default-pfp.png';
            const adminButtons = isAdmin ? `
                <button onclick="deleteBoardMember('${member._id}')" class="absolute top-3 left-3 w-8 h-8 rounded-full bg-destructive/20 hover:bg-destructive/40 flex items-center justify-center text-destructive/80 hover:text-destructive transition-all z-10" title="Delete Board Member"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                <button onclick="openEditBoardMember('${member._id}')" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all z-10" title="Edit Board Member"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
            ` : '';

            return `
                <div data-aos="fade-up" data-aos-delay="${delay}" class="group bg-card backdrop-blur-md rounded-2xl border border-border/50 p-8 text-center hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 w-48 relative">
                  ${adminButtons}
                  <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(member.name)}" class="w-16 h-16 rounded-full object-cover border-2 border-primary/50 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg bg-black/20">
                  <h3 class="font-semibold text-lg leading-tight mb-1">${escapeHtml(member.name)}</h3>
                  <p class="text-sm font-medium text-[#1f6feb]">${escapeHtml(member.position)}</p>
                </div>
            `;
        }).join('');

        lucide.createIcons();
        setTimeout(() => AOS.refresh(), 100);
    } catch (err) {
        console.error('Error loading board members:', err);
        container.innerHTML = '<p class="text-white/60">Failed to load board members.</p>';
    }
}

function openAddBoardMemberModal() {
    document.getElementById('boardModalTitle').textContent = 'Add Board Member';
    document.getElementById('boardMemberForm').reset();
    document.getElementById('board-member-id').value = '';
    openModal('boardMemberModal');
}

function openEditBoardMember(id) {
    const member = boardMembers.find(m => m._id === id);
    if (!member) return;

    document.getElementById('boardModalTitle').textContent = 'Edit Board Member';
    document.getElementById('board-member-id').value = member._id;
    document.getElementById('board-member-name').value = member.name || '';
    document.getElementById('board-member-position').value = member.position || '';
    document.getElementById('board-member-image').value = member.image || '';
    document.getElementById('board-member-order').value = member.order || 0;
    openModal('boardMemberModal');
}

function closeBoardMemberModal() {
    closeModal('boardMemberModal');
}

async function saveBoardMember(event) {
    event.preventDefault();
    const id = document.getElementById('board-member-id').value;
    const body = {
        name: document.getElementById('board-member-name').value.trim(),
        position: document.getElementById('board-member-position').value.trim(),
        image: document.getElementById('board-member-image').value.trim() || '/images/Default-pfp.png',
        order: parseInt(document.getElementById('board-member-order').value) || 0
    };

    try {
        await apiFetch(id ? `/api/v1/board/${id}` : '/api/v1/board', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(body)
        });
        closeBoardMemberModal();
        loadPublicBoardMembers();
        showMsg(id ? 'Board member updated!' : 'Board member added!');
    } catch (err) {
        showMsg(err.message || 'Failed to save board member', 'error');
    }
}

async function deleteBoardMember(id) {
    if (!confirm('Are you sure you want to delete this board member?')) return;
    try {
        await apiFetch(`/api/v1/board/${id}`, { method: 'DELETE' });
        loadPublicBoardMembers();
        showMsg('Board member deleted!');
    } catch (err) {
        showMsg('Failed to delete board member', 'error');
    }
}

document.addEventListener('DOMContentLoaded', loadPublicBoardMembers);
