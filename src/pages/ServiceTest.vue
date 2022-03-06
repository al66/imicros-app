<template>
  <div>
    <!-- panels -->
    <!-- panels -->
    <q-tab-panels v-model="tab">
      <!-- editor panel -->
      <q-tab-panel
        name="editor"
        class="q-pt-none"
      >
        <q-toolbar>
          <q-space />
          <q-select
            dense
            borderless
            use-input
            clearable
            v-model="serviceSelected"
            :options="serviceOptions"
            @filter="filterServices"
            label="Service"
            style="min-width: 250px"
          >
            <template #prepend>
              <q-icon name="bi-gear" />
            </template>
          </q-select>
          <q-space />
        </q-toolbar>
        <div :class="{ 'truncate-chip-labels': true }">
          <q-chip dense>
            {{ service ? ( service.method || 'POST' ) + ' ' + baseUrl + service.value : baseUrl }}
          </q-chip>
          <q-chip
            v-if="service.git"
            icon="bi-github"
            :label="service.git"
            clickable
            dense
            @click="git(service.git)"
          />
        </div>
        <q-splitter
          v-model="splitter.templates"
          :limits="[30, 100]"
          style="height:100%"
        >
          <template #before>
            <q-toolbar>
              <q-chip
                outline
                square
                color="primary"
              >
                Parameter
              </q-chip>
              <q-space />
              <toolbar-btn
                icon="ion-play"
                @click="call"
              />
              <q-space />
            </q-toolbar>
            <q-scroll-area style="height: calc(100vh - 50px - 120px);">
              <editor
                v-model:content="test.data"
                lang="json"
                width="100%"
              />
            </q-scroll-area>
          </template>
          <template #separator>
            <q-avatar
              color="primary"
              text-color="white"
              size="30px"
              icon="drag_indicator"
            />
          </template>
          <template #after>
            <q-toolbar>
              <q-chip
                outline
                square
                color="primary"
              >
                Result
              </q-chip>
              <q-space />
              <q-space />
            </q-toolbar>
            <q-scroll-area style="height: calc(100vh - 50px - 120px);">
              <editor
                v-model:content="test.result"
                readonly
                lang="json"
                width="100%"
              />
            </q-scroll-area>
          </template>
        </q-splitter>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import { ref } from 'vue'
// vuex store
import { mapGetters } from 'vuex'
// components
import Editor from 'src/components/global/Editor.vue'
import ToolbarBtn from 'src/components/global/ToolbarBtn.vue'

const services = [{
  label: 'flow.event.emit',
  value: 'flow.event.emit',
  description: 'emit event to start process',
  example: {
    eventName: 'ersatzteil.benötigt',
    payload: {
      any: 'object'
    }
  }
},
{
  label: 'flow.control.getProcesses',
  value: 'flow.control.getProcesses',
  method: 'GET',
  git: 'https://github.com/al66/imicros-flow-control#readme'
},
{
  label: 'flow.query.getElements',
  value: 'flow.query.getElements',
  method: 'GET',
  example: {
    processId: '6d3b91ca-c1cc-4011-8e96-1fe8eadf5a4d',
    versionId: 'c897f362-41ca-4809-b808-dbeb81257dc1'
  },
  git: 'https://github.com/al66/imicros-flow-control#readme'
},
{
  label: 'flow.query.previous',
  value: 'flow.query.previous',
  method: 'GET',
  example: {
    processId: '6d3b91ca-c1cc-4011-8e96-1fe8eadf5a4d',
    elementId: 'cc8454fd-6185-4170-96ac-94dc00c50a98'
  },
  git: 'https://github.com/al66/imicros-flow-control#readme'
},
{
  label: 'flow.query.next',
  value: 'flow.query.next',
  method: 'GET',
  example: {
    processId: '6d3b91ca-c1cc-4011-8e96-1fe8eadf5a4d',
    elementId: 'cc8454fd-6185-4170-96ac-94dc00c50a98'
  },
  git: 'https://github.com/al66/imicros-flow-control#readme'
},
{
  label: 'flow.query.getTask',
  value: 'flow.query.getTask',
  method: 'GET',
  example: {
    processId: '6d3b91ca-c1cc-4011-8e96-1fe8eadf5a4d',
    elementId: 'cc8454fd-6185-4170-96ac-94dc00c50a98'
  },
  git: 'https://github.com/al66/imicros-flow-control#readme'
},
{
  label: 'flow.queue.add',
  value: 'flow.queue.add',
  description: 'add item to queue',
  help: 'link to help',
  example: {
    serviceId: 'f332d779-6441-4d8c-b06f-dc3ade10b6e3',
    value: {
      any: 'content'
    }
  },
  git: 'https://github.com/al66/imicros-queue#readme'
},
{
  label: 'flow.queue.fetch',
  value: 'flow.queue.fetch',
  help: 'link',
  example: {
    serviceId: 'f332d779-6441-4d8c-b06f-dc3ade10b6e3',
    workerId: 'single'
  },
  git: 'https://github.com/al66/imicros-queue#readme'
},
{
  label: 'flow.queue.ack',
  value: 'flow.queue.ack',
  help: 'link',
  example: {
    serviceId: 'f332d779-6441-4d8c-b06f-dc3ade10b6e3',
    workerId: 'single',
    result: {
      purchaseOrderNumber: '9889765872',
      deliverDateExpected: '2022-03-20'
    }
  },
  git: 'https://github.com/al66/imicros-queue#readme'
},
{
  label: 'jsonMap.map',
  value: 'jsonMap.map',
  example: {
    template: {
      '{{a}}': '{{x}}',
      deep: {
        b: '{{sub.y}}'
      }
    },
    data: {
      a: 'KeyA',
      x: 'value x',
      sub: {
        y: 'value y'
      }
    }
  },
  git: 'https://github.com/al66/imicros-flow-map#readme'
},
{
  label: 'mails.send',
  value: 'mails.send',
  example: {
    account: 'path to your account data',
    message: {
      to: 'recepient@receiver.de',
      from: 'sender@your host.de',
      subject: 'First mail',
      text: 'Hello from imicros!',
      html: "<p><b>Hello</b> from imicros</p><p>Here's the imicros logo for you as an embedded attachment:<br/><img src=\"cid:logo.png\"/></p>",
      attachments: [
        {
          filename: 'imicros.png',
          path: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgd2lkdGg9IjE5NC40NTcxNG1tIgogICBoZWlnaHQ9IjQ1LjAwNjcwMm1tIgogICB2aWV3Qm94PSIwIDAgMTk0LjQ1NzE0IDQ1LjAwNjcwMiIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnOCIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMS4wLjEgKDNiYzJlODEzZjUsIDIwMjAtMDktMDcpIgogICBzb2RpcG9kaTpkb2NuYW1lPSJpbWljcm9zLWxvZ28tYmxhY2suc3ZnIj4KICA8ZGVmcwogICAgIGlkPSJkZWZzMiIgLz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMC45NCIKICAgICBpbmtzY2FwZTpjeD0iMzY4LjA4ODgyIgogICAgIGlua3NjYXBlOmN5PSItNzUuMjA2MTk4IgogICAgIGlua3NjYXBlOmRvY3VtZW50LXVuaXRzPSJtbSIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJsYXllcjEiCiAgICAgaW5rc2NhcGU6ZG9jdW1lbnQtcm90YXRpb249IjAiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTkyMCIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSIxMDAxIgogICAgIGlua3NjYXBlOndpbmRvdy14PSIzODMxIgogICAgIGlua3NjYXBlOndpbmRvdy15PSIxNTU2IgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGUgLz4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICBpbmtzY2FwZTpsYWJlbD0iRWJlbmUgMSIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlkPSJsYXllcjEiCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTguNDQzMTY2OSwtNjYuNzM1MTg3KSI+CiAgICA8ZwogICAgICAgaWQ9ImcxMDkiPgogICAgICA8cGF0aAogICAgICAgICBzdHlsZT0iZm9udC1zdHlsZTpub3JtYWw7Zm9udC12YXJpYW50Om5vcm1hbDtmb250LXdlaWdodDpub3JtYWw7Zm9udC1zdHJldGNoOm5vcm1hbDtmb250LXNpemU6NjIuNzQ1OXB4O2xpbmUtaGVpZ2h0OjEuMjU7Zm9udC1mYW1pbHk6J0JhdWhhdXMgOTMnOy1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246J0JhdWhhdXMgOTMsICc7ZmlsbDojZmY2NjAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDoxLjU2ODY4IgogICAgICAgICBkPSJtIDE0LjIwMzA0NCw2Ni43MzUxODcgcSAyLjMyODQ2MSwwIDQuMDEzNTMyLDEuNjU0NDMzIDEuNzE1NzA4LDEuNjIzNzk1IDEuNzE1NzA4LDMuODYwMzQzIDAsMi4zODk3MzcgLTEuNjIzNzk1LDMuOTIxNjE5IC0xLjU5MzE1OCwxLjUzMTg4MiAtNC4xMDU0NDUsMS41MzE4ODIgLTIuNTEyMjg3LDAgLTQuMTM2MDgyLC0xLjUzMTg4MiAtMS41OTMxNTc1LC0xLjUzMTg4MiAtMS41OTMxNTc1LC0zLjkyMTYxOSAwLC0yLjIzNjU0OCAxLjY4NTA3MDUsLTMuODYwMzQzIDEuNzE1NzA4LC0xLjY1NDQzMyA0LjA0NDE2OSwtMS42NTQ0MzMgeiIKICAgICAgICAgaWQ9InBhdGg4NCIgLz4KICAgICAgPHBhdGgKICAgICAgICAgc3R5bGU9ImZvbnQtc3R5bGU6bm9ybWFsO2ZvbnQtdmFyaWFudDpub3JtYWw7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtc3RyZXRjaDpub3JtYWw7Zm9udC1zaXplOjYyLjc0NTlweDtsaW5lLWhlaWdodDoxLjI1O2ZvbnQtZmFtaWx5OidCYXVoYXVzIDkzJzstaW5rc2NhcGUtZm9udC1zcGVjaWZpY2F0aW9uOidCYXVoYXVzIDkzLCAnO2ZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MS41Njg2OCIKICAgICAgICAgZD0ibSAxOS45MDE2NDcsODAuMzY4OTQgdiAzMC41NDU3MyBIIDguNDQzMTY2OSBWIDgwLjM2ODk0IFoiCiAgICAgICAgIGlkPSJwYXRoNTYiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Ik0gNjguNTU0MjI4LDExMC45MTQ2NyBIIDU3LjA5NTc0OCBWIDk0LjQzMTYxOSBxIDAsLTEuODk5NTM0IC0wLjM5ODI4OSwtMi42MzQ4MzcgLTAuMzk4MjksLTAuNzM1MzA0IC0xLjQzOTk3LC0wLjczNTMwNCAtMS45MzAxNzEsMCAtMS45MzAxNzEsMy40MDA3NzkgViAxMTAuOTE0NjcgSCA0MS44Njg4MzggViA5NC40MzE2MTkgcSAwLC0xLjg5OTUzNCAtMC40Mjg5MjcsLTIuNjM0ODM3IC0wLjM5ODI4OSwtMC43MzUzMDQgLTEuNDM5OTY5LC0wLjczNTMwNCAtMS44OTk1MzUsMCAtMS44OTk1MzUsMy40MDA3NzkgViAxMTAuOTE0NjcgSCAyNi42NDE5MjggViA5Mi4xMDMxNTggcSAwLC01LjE0NzEyNCAzLjQ2MjA1NCwtOC43MzE3MjkgMy40NjIwNTQsLTMuNjE1MjQyIDguMzk0NzE1LC0zLjYxNTI0MiA1LjA4NTg0OSwwIDkuMTMwMDE4LDQuMjg5MjcgNC41MDM3MzQsLTQuMjg5MjcgOS4wMDc0NjgsLTQuMjg5MjcgNS43MjkyNCwwIDkuMTkxMjk0LDQuMTY2NzIgMi43MjY3NTEsMy4yNDc1OSAyLjcyNjc1MSw5LjQ2NzAzMiB6IgogICAgICAgICBzdHlsZT0iZm9udC1zdHlsZTpub3JtYWw7Zm9udC12YXJpYW50Om5vcm1hbDtmb250LXdlaWdodDpub3JtYWw7Zm9udC1zdHJldGNoOm5vcm1hbDtmb250LXNpemU6NjIuNzQ1OXB4O2xpbmUtaGVpZ2h0OjEuMjU7Zm9udC1mYW1pbHk6J0JhdWhhdXMgOTMnOy1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246J0JhdWhhdXMgOTMsICc7ZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDoxLjU2ODY4IgogICAgICAgICBpZD0icGF0aDU4IiAvPgogICAgICA8cGF0aAogICAgICAgICBzdHlsZT0iZm9udC1zdHlsZTpub3JtYWw7Zm9udC12YXJpYW50Om5vcm1hbDtmb250LXdlaWdodDpub3JtYWw7Zm9udC1zdHJldGNoOm5vcm1hbDtmb250LXNpemU6NjIuNzQ1OXB4O2xpbmUtaGVpZ2h0OjEuMjU7Zm9udC1mYW1pbHk6J0JhdWhhdXMgOTMnOy1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246J0JhdWhhdXMgOTMsICc7ZmlsbDojZmY2NjAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDoxLjU2ODY4IgogICAgICAgICBkPSJtIDgxLjAyMzc1NCw2Ni43MzUxODcgcSAyLjMyODQ2MSwwIDQuMDEzNTMxLDEuNjU0NDMzIDEuNzE1NzA4LDEuNjIzNzk1IDEuNzE1NzA4LDMuODYwMzQzIDAsMi4zODk3MzcgLTEuNjIzNzk1LDMuOTIxNjE5IC0xLjU5MzE1NywxLjUzMTg4MiAtNC4xMDU0NDQsMS41MzE4ODIgLTIuNTEyMjg3LDAgLTQuMTM2MDgzLC0xLjUzMTg4MiAtMS41OTMxNTcsLTEuNTMxODgyIC0xLjU5MzE1NywtMy45MjE2MTkgMCwtMi4yMzY1NDggMS42ODUwNywtMy44NjAzNDMgMS43MTU3MDgsLTEuNjU0NDMzIDQuMDQ0MTcsLTEuNjU0NDMzIHoiCiAgICAgICAgIGlkPSJwYXRoODAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIHN0eWxlPSJmb250LXN0eWxlOm5vcm1hbDtmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtc2l6ZTo2Mi43NDU5cHg7bGluZS1oZWlnaHQ6MS4yNTtmb250LWZhbWlseTonQmF1aGF1cyA5Myc7LWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjonQmF1aGF1cyA5MywgJztmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjEuNTY4NjgiCiAgICAgICAgIGQ9Im0gODYuNzIyMzU2LDgwLjM2ODk0IHYgMzAuNTQ1NzMgSCA3NS4yNjM4NzYgViA4MC4zNjg5NCBaIgogICAgICAgICBpZD0icGF0aDYwIiAvPgogICAgICA8cGF0aAogICAgICAgICBkPSJtIDExMi4yMTI4OCw5Ni44NTE5OTMgMTEuMzY2NTYsLTAuNDI4OTI3IHEgLTAuNDkwMiw2LjYxNzczNCAtNC45MzI2NiwxMC44NzYzNjQgLTQuNDQyNDYsNC4yNTg2MyAtMTAuODE1MDksNC4yNTg2MyAtNi43NDAyOCwwIC0xMS4zOTcyMDEsLTQuNjg3NTYgLTQuNjI2Mjg1LC00LjY4NzU2IC00LjYyNjI4NSwtMTEuNDg5MTE0IDAsLTYuNDY0NTQzIDQuNjg3NTYsLTExLjA2MDE5IDQuNjg3NTU2LC00LjU5NTY0NyAxMS4yNDQwMTYsLTQuNTk1NjQ3IDUuNzI5MjQsMCAxMC4xMTA0MiwzLjYxNTI0MiA0LjM4MTE5LDMuNjE1MjQzIDUuNDUzNSw5LjIyMTkzMiBsIC0xMS42MTE2NiwwLjQyODkyNyBxIC0xLjUwMTI1LC0xLjk2MDgwOSAtMy43OTkwNywtMS45NjA4MDkgLTEuOTYwODEsMCAtMy4yMTY5NSwxLjI4Njc4MSAtMS4yNTYxNSwxLjI4Njc4MSAtMS4yNTYxNSwzLjI0NzU5IDAsMS45OTE0NDcgMS4zMTc0MiwzLjMzOTUwNCAxLjM0ODA2LDEuMzQ4MDU0IDMuMzM5NSwxLjM0ODA1NCAyLjkxMDU4LDAgNC4xMzYwOSwtMy40MDA3NzcgeiIKICAgICAgICAgc3R5bGU9ImZvbnQtc3R5bGU6bm9ybWFsO2ZvbnQtdmFyaWFudDpub3JtYWw7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtc3RyZXRjaDpub3JtYWw7Zm9udC1zaXplOjYyLjc0NTlweDtsaW5lLWhlaWdodDoxLjI1O2ZvbnQtZmFtaWx5OidCYXVoYXVzIDkzJzstaW5rc2NhcGUtZm9udC1zcGVjaWZpY2F0aW9uOidCYXVoYXVzIDkzLCAnO2ZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MS41Njg2OCIKICAgICAgICAgaWQ9InBhdGg2MiIgLz4KICAgICAgPHBhdGgKICAgICAgICAgZD0ibSAxNDUuMzMyMTYsODAuMDYyNTYzIHYgMTIuMjU1MDU5IHEgLTEuMTk0ODcsLTAuNjc0MDI5IC0yLjE3NTI3LC0wLjY3NDAyOSAtMy4xMjUwNCwwIC0zLjEyNTA0LDQuNzc5NDczIFYgMTEwLjkxNDY3IEggMTI4LjU3MzM3IFYgOTQuMjE3MTU2IHEgMCwtNi42MTc3MzIgMy42MTUyNCwtMTAuNTM5MzUxIDMuNjE1MjQsLTMuOTUyMjU2IDkuNjUwODYsLTMuOTUyMjU2IDEuMzQ4MDYsMCAzLjQ5MjY5LDAuMzM3MDE0IHoiCiAgICAgICAgIHN0eWxlPSJmb250LXN0eWxlOm5vcm1hbDtmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtc2l6ZTo2Mi43NDU5cHg7bGluZS1oZWlnaHQ6MS4yNTtmb250LWZhbWlseTonQmF1aGF1cyA5Myc7LWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjonQmF1aGF1cyA5MywgJztmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjEuNTY4NjgiCiAgICAgICAgIGlkPSJwYXRoNjQiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gMTYzLjE5MzkxLDc5LjcyNTU0OSBxIDYuNDk1MTgsMCAxMS4xMjE0Nyw0LjY4NzU2IDQuNjU2OTIsNC42NTY5MjIgNC42NTY5MiwxMS4xODI3NDEgMCw2LjYxNzczIC00LjcxODIsMTEuMjc0NjUgLTQuNjg3NTYsNC42NTY5MyAtMTEuMzM1OTMsNC42NTY5MyAtNi42NDgzNiwwIC0xMS4zNjY1NiwtNC42NTY5MyAtNC43MTgyLC00LjY4NzU2IC00LjcxODIsLTExLjI3NDY1IDAsLTYuNzA5NjQ1IDQuNzE4MiwtMTEuMjc0NjU0IDQuNzE4MiwtNC41OTU2NDcgMTEuNjQyMywtNC41OTU2NDcgeiBtIC0wLjMwNjM3LDExLjMwNTI5MiBxIC0xLjgzODI2LDAgLTMuMTI1MDQsMS4zNDgwNTYgLTEuMjg2NzgsMS4zMTc0MTkgLTEuMjg2NzgsMy4yNDc1OSAwLDEuODk5NTM1IDEuMjg2NzgsMy4yNDc1OTEgMS4zMTc0MiwxLjM0ODA1MiAzLjEyNTA0LDEuMzQ4MDUyIDEuODM4MjYsMCAzLjEyNTA0LC0xLjM0ODA1MiAxLjMxNzQyLC0xLjM0ODA1NiAxLjMxNzQyLC0zLjI0NzU5MSAwLC0xLjkzMDE3MSAtMS4yODY3OSwtMy4yNDc1OSAtMS4yODY3OCwtMS4zNDgwNTYgLTMuMTU1NjcsLTEuMzQ4MDU2IHoiCiAgICAgICAgIHN0eWxlPSJmb250LXN0eWxlOm5vcm1hbDtmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtc2l6ZTo2Mi43NDU5cHg7bGluZS1oZWlnaHQ6MS4yNTtmb250LWZhbWlseTonQmF1aGF1cyA5Myc7LWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjonQmF1aGF1cyA5MywgJztmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjEuNTY4NjgiCiAgICAgICAgIGlkPSJwYXRoNjYiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIGQ9Im0gMjAyLjkwMDMsODAuNzk3ODY3IHYgMTIuMDcxMjMyIHEgLTIuNDIwMzcsMCAtMy4zMzk1LDAuOTE5MTMgLTAuODg4NDksMC44ODg0OTEgLTEuMTMzNTksMy41NTM5NjcgLTAuNzk2NTgsOC44NTQyODQgLTYuODYyODMsMTIuNTAwMTY0IC0zLjIxNjk2LDEuODk5NTMgLTkuMTMwMDIsMS44OTk1MyBIIDE4MC44NDEyIFYgOTkuNjA5MzgxIGggMC41MjA4NCBxIDIuNzU3MzksMCAzLjkyMTYyLC0xLjEzMzU5MiAxLjE5NDg3LC0xLjE2NDIzMSAxLjM3ODY5LC00LjA0NDE3IDAuMjQ1MSwtNC42ODc1NiAwLjg1Nzg2LC02LjU4NzA5NCAwLjY0MzM5LC0xLjg5OTUzNCAyLjU3MzU2LC0zLjc2ODQzIDMuMzcwMTQsLTMuMjc4MjI4IDkuMzQ0NDgsLTMuMjc4MjI4IHoiCiAgICAgICAgIHN0eWxlPSJmb250LXN0eWxlOm5vcm1hbDtmb250LXZhcmlhbnQ6bm9ybWFsO2ZvbnQtd2VpZ2h0Om5vcm1hbDtmb250LXN0cmV0Y2g6bm9ybWFsO2ZvbnQtc2l6ZTo2Mi43NDU5cHg7bGluZS1oZWlnaHQ6MS4yNTtmb250LWZhbWlseTonQmF1aGF1cyA5Myc7LWlua3NjYXBlLWZvbnQtc3BlY2lmaWNhdGlvbjonQmF1aGF1cyA5MywgJztmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjEuNTY4NjgiCiAgICAgICAgIGlkPSJwYXRoNjgiIC8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K',
          cid: 'logo.png'
        }
      ]
    }
  },
  git: 'https://github.com/al66/imicros-mails#readme'
}]

export default {
  name: 'ServiceTest',
  components: {
    Editor,
    ToolbarBtn
  },
  setup () {
    const serviceSelected = ref({ label: '', value: '' })
    const serviceOptions = ref(services)
    const test = ref({ data: '', result: '' })
    const baseUrl = ref(location.origin + '/api/')
    return {
      tab: 'editor',
      serviceSelected,
      serviceOptions,
      test,
      baseUrl,
      splitter: {
        templates: 50, // start at 80%
        testdata: 30,
        testresult: 50
      },
      filterServices (val, update) {
        update(() => {
          if (val === '') {
            serviceOptions.value = services
          } else {
            const needle = val.toLowerCase()
            serviceOptions.value = services.filter(
              v => v.value.toLowerCase().indexOf(needle) > -1
            )
          }
        })
      }
    }
  },
  watch: {
    service: function (newVal) {
      this.test.result = ''
      if (!newVal || !newVal.example) {
        this.test.data = '{}'
      } else {
        this.test.data = JSON.stringify(newVal.example, null, '\t')
      }
    }
  },
  computed: {
    ...mapGetters({
      access: 'access'
    }),
    service: function () {
      if (!this.serviceSelected) return { label: '', value: '' }
      return this.serviceSelected
    }
  },
  methods: {
    call () {
      this.test.result = ''
      const index = services.findIndex(service => { return service.value === this.service.value })
      if (index >= 0) {
        const instance = this.$instance()
        instance.defaults.headers.common['x-imicros-xtoken'] = this.access.token
        instance.defaults.headers.common['Content-Type'] = 'application/json'
        let params
        try {
          params = JSON.parse(this.test.data)
        } catch (err) {
          console.log('Wrong parameters - failed to parse', err)
        }
        const method = this.service.method ? this.service.method.toLowerCase() : 'post'
        const request = {
          method,
          url: '/api/' + this.service.value,
          data: method !== 'get' ? params : null,
          params: method === 'get' ? params : null
        }
        instance.request(request).then((result) => {
          // console.log(result)
          if (result) {
            if ('data' in result) {
              try {
                this.test.result = JSON.stringify(result.data, null, '\t')
              } catch (err) {
                this.test.result = result.data
              }
            } else {
              this.test.result = result
            }
          }
        }).catch((err) => {
          // console.error('Failed to call service ' + this.service.value, err)
          this.test.result = err.toString()
        })
      }
    },
    git (url) {
      window.open(url)
    }
  }
}
</script>
